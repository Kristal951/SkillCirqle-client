export const RATE_LIMITS = {
  "auth-callback": {
    points: 5,
    duration: 600,
  },
  "auth-password-update": {
    points: 3,
    duration: 600,
  },
  "geo-reverse": {
    points: 60,
    duration: 60,
  },
  "mfa-recovery": {
    points: 3,
    duration: 900,
  },
  "mfa-recovery-delete": {
    points: 5,
    duration: 900,
  },
  "mfa-verify": {
    points: 5,
    duration: 600,
  },
  "notif-get": {
    points: 200,
    duration: 60,
  },

  "notif-patch": {
    points: 15,
    duration: 60,
  },
  "onboarding-status": {
    points: 200,
    duration: 60,
  },
  "profile-get": {
    points: 200,
    duration: 60,
  },

  "create-post": { points: 10, duration: 60 },
  feed: { points: 80, duration: 60 },
  search: { points: 40, duration: 60 },
  "ai-tutor": { points: 5, duration: 60 },
  "auth-login": { points: 5, duration: 300 },
  default: { points: 60, duration: 60 },
};
