// src/utils/profileName.js

export function getDisplayName(user) {
  if (!user) return "";

  // If the user has a display name, return initials
  if (user.displayName) {
    return user.displayName
      .split(" ")
      .map((n) => n[0].toUpperCase())
      .join(""); // "Divyanshu Kumar" → "DK"
  }

  // Otherwise, fallback: use first part of email (shortened)
  if (user.email) {
    return user.email.split("@")[0].substring(0, 6); // "dk1474"
  }

  return "User";
}