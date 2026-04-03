import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@lingua_user_id';

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export async function getUserId(): Promise<string | null> {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    return userId;
  } catch {
    return null;
  }
}

export async function getOrCreateUserId(): Promise<string> {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = generateUUID();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    
    return userId;
  } catch {
    return generateUUID();
  }
}

export async function clearUserId(): Promise<void> {
  await AsyncStorage.removeItem(USER_ID_KEY);
}
