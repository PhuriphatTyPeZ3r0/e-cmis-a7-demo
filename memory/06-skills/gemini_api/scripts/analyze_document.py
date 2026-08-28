#!/usr/bin/env python3
"""
analyze_document.py
Starter script to analyze DOCX document structure or DrawIO schema XML using Google GenAI SDK.
"""

import os
import sys
from google import genai
from google.genai import types

def init_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)
    return genai.Client(api_key=api_key)

def analyze_document_structure(file_path: str):
    client = init_client()
    
    print(f"Reading file: {file_path}...")
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}", file=sys.stderr)
        sys.exit(1)
        
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # Determine file type
    mime_type = "text/plain"
    if file_path.endswith(".drawio") or file_path.endswith(".xml"):
        mime_type = "application/xml"
    elif file_path.endswith(".docx"):
        mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
    print(f"Sending file to Gemini ({mime_type}) for analysis...")
    
    # We can upload the document using Part.from_bytes
    part = types.Part.from_bytes(
        data=file_bytes,
        mime_type=mime_type
    )
    
    prompt = """
    Analyze the uploaded document or diagram schema for standard conformity:
    1. If it's a DOCX, check if the fonts are consistent, standard margins are used, and headings are properly structured.
    2. If it's a DrawIO XML schema, check the connectedness of shapes and identify any isolated blocks.
    3. Return a clean analysis report listing any formatting errors or structural issues.
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[part, prompt]
    )
    
    print("\n--- Gemini Analysis Report ---")
    print(response.text)
    print("------------------------------")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_document.py <path-to-docx-or-drawio-file>")
        sys.exit(1)
        
    analyze_document_structure(sys.argv[1])
