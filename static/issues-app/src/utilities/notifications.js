import { showFlag } from "@forge/bridge";

export const showSuccessFlag = (message, description = "", actions = []) => {
  return showFlag({
    id: `success-${Date.now()}`,
    title: message,
    type: "success",
    description,
    actions,
    isAutoDismiss: true,
  });
};

export const showErrorFlag = (message, description = "", actions = []) => {
  return showFlag({
    id: `error-${Date.now()}`,
    title: message,
    type: "error",
    description,
    actions,
    isAutoDismiss: false,
  });
};

export const showInfoFlag = (
  message,
  description = "",
  isAutoDismiss = true
) => {
  return showFlag({
    id: `info-${Date.now()}`,
    title: message,
    type: "info",
    description,
    isAutoDismiss,
  });
};

export const showLoadingFlag = (message) => {
  return showFlag({
    id: `loading-${Date.now()}`,
    title: message,
    type: "info",
    isAutoDismiss: false,
  });
};
