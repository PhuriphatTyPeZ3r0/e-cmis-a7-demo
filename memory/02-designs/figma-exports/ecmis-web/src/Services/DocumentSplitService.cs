using EcmisWeb.Data;

namespace EcmisWeb.Services;

/// <summary>
/// Document Split Service
/// Handles large scanned documents by splitting them into chunks (100-500 pages per chunk)
/// Prevents system overload on large file processing
/// </summary>
public class DocumentSplitService
{
    private const int MIN_PAGES_PER_CHUNK = 100;
    private const int MAX_PAGES_PER_CHUNK = 500;
    
    private List<DocumentMetadata> _documents = new();
    private readonly ILogger<DocumentSplitService> _logger;

    public DocumentSplitService(ILogger<DocumentSplitService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Process uploaded document and determine if splitting is needed
    /// </summary>
    public List<DocumentMetadata> ProcessDocument(string fileName, int pageCount, long fileSizeBytes)
    {
        try
        {
            _logger.LogInformation($"Processing document: {fileName}, Pages: {pageCount}");

            var documents = new List<DocumentMetadata>();

            if (pageCount <= MAX_PAGES_PER_CHUNK)
            {
                // No split needed
                documents.Add(new DocumentMetadata
                {
                    Id = _documents.Count + 1,
                    FileName = fileName,
                    FileSizeBytes = fileSizeBytes,
                    FileType = GetFileType(fileName),
                    PageCount = pageCount,
                    UploadedDate = DateTime.Now,
                    IsSplit = false,
                    TotalSplitParts = 1,
                    CurrentPartNumber = 1,
                    SplitGroupId = Guid.NewGuid().ToString()
                });
            }
            else
            {
                // Split needed
                var splitGroupId = Guid.NewGuid().ToString();
                var totalParts = (int)Math.Ceiling((double)pageCount / MAX_PAGES_PER_CHUNK);
                var pagesPerPart = (int)Math.Ceiling((double)pageCount / totalParts);

                for (int i = 0; i < totalParts; i++)
                {
                    var startPage = i * pagesPerPart + 1;
                    var endPage = Math.Min((i + 1) * pagesPerPart, pageCount);
                    var currentPartPages = endPage - startPage + 1;

                    documents.Add(new DocumentMetadata
                    {
                        Id = _documents.Count + documents.Count + 1,
                        FileName = $"{Path.GetFileNameWithoutExtension(fileName)}_Part{i + 1}{Path.GetExtension(fileName)}",
                        FileSizeBytes = (long)(fileSizeBytes * (double)currentPartPages / pageCount),
                        FileType = GetFileType(fileName),
                        PageCount = currentPartPages,
                        UploadedDate = DateTime.Now,
                        IsSplit = true,
                        TotalSplitParts = totalParts,
                        CurrentPartNumber = i + 1,
                        SplitGroupId = splitGroupId
                    });

                    _logger.LogInformation($"Split part {i + 1}/{totalParts}: Pages {startPage}-{endPage}");
                }
            }

            _documents.AddRange(documents);
            return documents;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error processing document: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get all documents for a split group (linking back to parent case)
    /// </summary>
    public List<DocumentMetadata> GetDocumentsByGroupId(string splitGroupId)
    {
        return _documents.Where(d => d.SplitGroupId == splitGroupId).ToList();
    }

    /// <summary>
    /// Get document metadata by ID
    /// </summary>
    public DocumentMetadata? GetDocumentById(int id)
    {
        return _documents.FirstOrDefault(d => d.Id == id);
    }

    /// <summary>
    /// Get all documents for a case
    /// </summary>
    public List<DocumentMetadata> GetAllDocuments()
    {
        return _documents;
    }

    /// <summary>
    /// Delete document and all its split parts
    /// </summary>
    public void DeleteDocumentGroup(string splitGroupId)
    {
        try
        {
            var docsToDelete = _documents.Where(d => d.SplitGroupId == splitGroupId).ToList();
            foreach (var doc in docsToDelete)
            {
                _documents.Remove(doc);
                _logger.LogInformation($"Deleted document: {doc.FileName}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting document group: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get file type from file extension
    /// </summary>
    private string GetFileType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLower();
        return extension switch
        {
            ".pdf" => "PDF",
            ".doc" or ".docx" => "Word",
            ".xls" or ".xlsx" => "Excel",
            ".jpg" or ".jpeg" or ".png" => "Image",
            _ => "Unknown"
        };
    }

    /// <summary>
    /// Estimate split parts needed
    /// </summary>
    public int CalculateSplitParts(int totalPages)
    {
        if (totalPages <= MAX_PAGES_PER_CHUNK)
            return 1;
        
        return (int)Math.Ceiling((double)totalPages / MAX_PAGES_PER_CHUNK);
    }
}
