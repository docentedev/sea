/*
{
  "file": {
    "id": 1,
    "name": "IMG_6799.MOV",
    "mime_type": "video/quicktime",
    "size": 6484022
  },
  "link": {
    "token": "ZbQhERmSRuKR3QLTZ0MM2Q",
    "expires_at": null,
    "max_access_count": null,
    "access_count": 5,
    "revoked": false
  }
}
*/
export interface SharedLink {
    file: {
        id: number;
        name: string;
        mime_type: string;
        size: number;
    };
    link: {
        token: string;
        expires_at?: string;
        max_access_count?: number;
        access_count: number;
        revoked: boolean;
    };
}


export interface CreateSharedLinkData {
    file_id: number;
    user_id?: number;
    password?: string;
    expires_at?: string;
    max_access_count?: number;
}
