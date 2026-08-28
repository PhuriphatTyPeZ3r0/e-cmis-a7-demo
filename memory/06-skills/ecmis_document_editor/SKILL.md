---
name: ecmis-document-editor
description: Skill for editing DOCX files and DrawIO diagrams for the E-CMIS project.
---

# E-CMIS Document Editor Skill

This skill contains tools and scripts for manipulating DOCX files (formatting, analyzing, cover page generation) and DrawIO diagram files.

## When to use this skill
- When the user asks to "edit docx", format documents, or fix templates for the E-CMIS project.
- When the user asks to "edit drawio", manipulate diagrams, or verify diagram contents.

## Available Scripts (Layer 3 - Execution)
The `scripts/` directory contains Python scripts for performing specific tasks:

1. `format_document.py` - Applies TH Sarabun New font, sets margins, and rebuilds the standard E-CMIS cover page from the PEP template.
2. `analyze_template.py` - Reads DOCX styles and structures for analysis.
3. `fix_template.py` - Fixes broken DOCX templates.
4. `generate_cover_pages.py` - Automates the generation of project cover pages.
5. `inspect_colors.py` - Reads RGB hex colors from DOCX elements.
6. `verify_formatting.py` & `verify_output.py` - Verifies that the DOCX file strictly follows the E-CMIS PEP formatting guidelines.

## How to use
To use any of these scripts, invoke them via Python from the `scripts` directory:
```bash
python skills/ecmis_document_editor/scripts/format_document.py
```
