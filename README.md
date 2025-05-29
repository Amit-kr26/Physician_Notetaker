# Physician Notetaker

Transform physician-patient conversation transcripts into structured medical notes using AI. This application processes .txt or .docx files to generate medical summaries, sentiment and intent analysis, and SOAP notes, combining them into a single JSON output.

## Overview

Physician Notetaker is a Flask-based web application that leverages OpenAI's GPT-4 Mini model to analyze physician-patient conversation transcripts. It extracts key medical details, assesses patient sentiment and intent, and generates structured SOAP notes. The results are combined into a JSON object and presented through a user-friendly interface with theme toggling and file download capabilities.

## Features

- Medical Summary Extraction: Extracts patient details, symptoms, diagnosis, treatment, status, and prognosis.

- Sentiment and Intent Analysis: Determines patient sentiment (Anxious, Neutral, Reassured) and intent (e.g., Seeking reassurance, Reporting symptoms).

- SOAP Note Generation: Produces structured SOAP (Subjective, Objective, Assessment, Plan) notes.

- Concurrent Processing: Utilizes ThreadPoolExecutor for efficient parallel processing of AI tasks.

- Responsive UI: Supports light and dark themes, drag-and-drop file uploads, and JSON result display with copy-to-clipboard functionality.

- File Support: Accepts .txt and .docx transcript files.

- Downloadable Output: Allows users to download structured notes as a JSON file.