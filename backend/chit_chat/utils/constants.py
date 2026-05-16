ALLOWED_MIME_TYPES = [
    # Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",

    # Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",

    # Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",

    # Documents
    "application/pdf",
    "text/plain",

    # Office files
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # docx
    "application/msword",  # doc

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # xlsx
    "application/vnd.ms-excel",  # xls

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",  # pptx
    "application/vnd.ms-powerpoint",  # ppt

    # Archives
    "application/zip",
]

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
