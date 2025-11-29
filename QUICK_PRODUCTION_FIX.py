# QUICK FIX for Production Backend
# Add this to your server.py CORS configuration section

# Find the CORS middleware configuration and replace with:

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporary: Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This will solve the CORS error immediately
# Later you can restrict it to specific domains
