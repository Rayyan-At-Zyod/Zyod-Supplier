/**
 * ========================== DEVELOPMENT PHASE ONLY - KINDLY IGNORE THIS CODE. ==========================
 */


import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_TASK_IDENTIFIER = "background-task";

// Register and create the task so that it is available also when the background task screen
// (a React component defined later in this example) is not visible.
// Note: This needs to be called in the global scope, not in a React component.
TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  try {
    const now = Date.now();
    console.log(
      `Got background task call at date: ${new Date(now).toISOString()}`
    );
  } catch (error) {
    console.error("Failed to execute the background task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  return BackgroundFetch.BackgroundFetchResult.Success;
});

// 2. Register the task at some point in your app by providing the same name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
export default async function registerBackgroundTaskAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER);
}