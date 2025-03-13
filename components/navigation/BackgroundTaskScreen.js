/**
 * ========================== DEVELOPMENT PHASE ONLY - KINDLY IGNORE THIS CODE. ==========================
 */

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";

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
async function registerBackgroundTaskAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER);
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background task calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function unregisterBackgroundTaskAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER);
}

export default function BackgroundTaskScreen() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    checkStatusAsync();
  }, []);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    console.log("Status found:", status);
    setStatus(status);
  };

  const toggle = async () => {
    console.log(
      "Trying to toggle background task. isRegistered:",
      isRegistered
    );
    try {
      if (!isRegistered) {
        // If not registered, register the task
        await registerBackgroundTaskAsync();
      } else {
        // If already registered, unregister the task
        await unregisterBackgroundTaskAsync();
      }
    } catch (err) {
      console.error(err);
    }
    // Update the state to reflect the new registration status
    setIsRegistered(!isRegistered);
    console.log("New registration state:", !isRegistered);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.textContainer}>
        <Text>
          Background Task Service Availability:{" "}
          <Text style={styles.boldText}>
            {status ? BackgroundFetch.BackgroundFetchStatus[status] : null}
          </Text>
        </Text>
      </View>
      <Button
        disabled={status === BackgroundFetch.BackgroundFetchStatus.Restricted}
        title={
          isRegistered ? "Cancel Background Task" : "Schedule Background Task"
        }
        onPress={toggle}
      />
      <Button title="Check Background Task Status" onPress={checkStatusAsync} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    margin: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
});
