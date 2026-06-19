export const getUserNotificationChannels = async (userId: String) => {
  try {
    const res = await fetch("/api/user/notification-settings");
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
