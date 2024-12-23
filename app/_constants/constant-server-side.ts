import "server-only";

export const VERIFICATION_LINK_EXPIRE_LIMIT = 7;
export const CUSTOM_ID_KEY = "customId"
export const CUSTOM_ID_REGEX = /{customId}/g;
export const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export const enum AttachmentFolder {
    USERS = 'users',
    ISSUES = 'issues',
    REQUIREMENTS = 'requirements',
    SYSTEM = 'system',
    PROFILE_PICTURES = 'profile-pictures',
}