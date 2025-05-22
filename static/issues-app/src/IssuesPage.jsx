import React, { useState } from "react";
import { ModalTransition } from "@atlaskit/modal-dialog";
import Spinner from "@atlaskit/spinner";
import Button from "@atlaskit/button/new";
import { useLoadProjects } from "./hooks/useLoadProjects";
import { useLoadAssignees } from "./hooks/useLoadAssignees";
import { useLoadIssues } from "./hooks/useLoadIssues";
import { IssuesTable } from "./components/IssuesTable";
import { UpdateIssueModal } from "./components/UpdateIssueModal";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import Pagination from "@atlaskit/pagination";
import { invoke, view } from "@forge/bridge";
import { useEffect } from "react";
import { showSuccessFlag, showErrorFlag } from "./utilities/Notifications";
import { useFetchStatuses } from "./hooks/useFetchStatuses";
import { CreateIssueModal } from "@forge/jira-bridge";
const issueTypeOptions = [
  { label: "Epic", value: "Epic" },
  { label: "Task", value: "task" },
  { label: "Story", value: "story" },
  { label: "Sub-task", value: "sub-task" },
];

export const IssuesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [apiCallError, setApiCallError] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [listIssues, setListIssues] = useState([]);
  const [currentIssue, setCurrentIssue] = useState(null);
  console.log("currentIssue", currentIssue);
  const [projectKey, setProjectKey] = useState("");
  const {
    projects,
    selectedProject,
    setSelectedProject,
    error: projectsError,
    isLoading: isLoadingProjects,
  } = useLoadProjects();
  const { assignees } = useLoadAssignees(selectedProject);
  const {
    issues,
    total,
    error: issuesError,
    isLoading: isLoadingIssues,
  } = useLoadIssues(selectedProject, currentPage);
  const {
    statusOptions,
    isLoading: isLoadingStatuses,
    error: statusError,
  } = useFetchStatuses(selectedProject, projectKey);
  const error = projectsError || issuesError;
  useEffect(async () => {
    const context = await view.getContext();
    setProjectKey(context.extension?.project?.key);
  }, []);

  const handleDelete = async (issueId, issue = {}) => {
    try {
      let result;
      const fullIssue = issue.id
        ? issue
        : issues.find((i) => i.id === issueId) || {};

      const hasSubtasks =
        fullIssue.type?.toLowerCase() === "task" &&
        fullIssue.children &&
        fullIssue.children.length > 0;

      if (hasSubtasks) {
        const confirmed = window.confirm(
          "This task has subtasks. Deleting it will also delete all subtasks. Continue?"
        );

        if (!confirmed) {
          return;
        }

        result = await invoke("deleteIssueWithSubtasks", { issueId });
        showSuccessFlag(
          result.message || "Task and subtasks deleted successfully!"
        );
      } else {
        result = await invoke("deleteIssue", { issueId });
        showSuccessFlag("Issue deleted successfully!");
      }

      const removeIssue = (issues, id) =>
        issues
          .filter((issue) => issue.id !== id)
          .map((issue) => ({
            ...issue,
            children: issue.children ? removeIssue(issue.children, id) : [],
          }));

      setListIssues(removeIssue(issues, issueId));
    } catch (err) {
      console.error("Failed to delete issue:", err);

      if (err.message.includes("subtasks")) {
        showErrorFlag(
          "Cannot delete issue with subtasks. Please delete subtasks first."
        );
      } else {
        showErrorFlag("Failed to delete issue");
      }

      setApiCallError(`Failed to delete issue: ${err.message}`);
    }
  };

  const handleUpdateSubmit = async (updatePayload) => {
    try {
      await invoke("updateIssue", updatePayload);

      const updatedIssues = issues.map((issue) => {
        if (issue.id === updatePayload.issueId) {
          // Get status text - handles both object and string cases
          const statusText =
            typeof updatePayload.fields.status === "object"
              ? updatePayload.fields.status.label
              : updatePayload.fields.status;

          return {
            ...issue,
            summary: updatePayload.fields.summary,
            description: updatePayload.fields.description,
            status: statusText, // Now always a string
            assignee:
              assignees.find((a) => a.value === updatePayload.fields.assignee)
                ?.label || issue.assignee,
            assigneeAccountId:
              updatePayload.fields.assignee || issue.assigneeAccountId,
          };
        }
        return issue;
      });

      setListIssues(updatedIssues);
      setIsUpdateModalOpen(false);
      showSuccessFlag("Issue updated successfully!");
    } catch (err) {
      console.error("Update error details:", err);
      showErrorFlag("Failed to update issue");
      setApiCallError(`Failed to update issue: ${err.message}`);
    }
  };
  const handleCreateIssue = async () => {
    try {
      if (!selectedProject) {
        showErrorFlag("Please select a project first");
        return;
      }

      const context = await view.getContext();
      const createIssueModal = new CreateIssueModal({
        onClose: (payload) => {
          console.log("CreateIssueModal closed with:", payload);
          if (payload?.issueKey) {
            showSuccessFlag(`Issue ${payload.issueKey} created successfully!`);
          }
        },
        context: {
          projectId: selectedProject.id,
          issueTypeId: "10012",
        },
      });

      createIssueModal.open();
    } catch (err) {
      console.error("Failed to open create issue modal:", err);
      showErrorFlag("Failed to open create issue form");
    }
  };
  const pages = Array.from({ length: Math.ceil(total / 5) }, (_, i) => i + 1);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>Issues</h2>
      {error && <div style={{ color: "#FF5630" }}>{error}</div>}
      {!isLoadingProjects && projects.length === 0 && !error && (
        <div>No projects available.</div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "space-between",
        }}
      >
        <DropdownMenu
          trigger={
            isLoadingProjects
              ? "Loading projects..."
              : selectedProject
              ? selectedProject.name
              : "Select Project"
          }
          triggerType="button"
          isDisabled={isLoadingProjects}
        >
          <DropdownItemGroup>
            {projects.map((project) => (
              <DropdownItem
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setCurrentPage(1);
                }}
              >
                {project.name}
              </DropdownItem>
            ))}
          </DropdownItemGroup>
        </DropdownMenu>
        {isLoadingProjects && <Spinner size="small" />}
        <Button onClick={handleCreateIssue} appearance="primary">
          Create Issue
        </Button>
      </div>

      {selectedProject && (
        <>
          <div style={{ minHeight: "300px", position: "relative" }}>
            {isLoadingIssues ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Spinner size="large" />
              </div>
            ) : (
              <IssuesTable
                issues={issues}
                isLoading={isLoadingIssues}
                onUpdate={(issue) => {
                  setCurrentIssue(issue);
                  setIsUpdateModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            )}
          </div>

          {total > 5 && (
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                pages={pages}
                onChange={(_, page) => setCurrentPage(page)}
                value={currentPage}
              />
            </div>
          )}
        </>
      )}

      <ModalTransition>
        {isUpdateModalOpen && (
          <UpdateIssueModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            issue={currentIssue}
            onUpdate={handleUpdateSubmit}
            statusOptions={statusOptions}
            issueTypeOptions={issueTypeOptions}
            assignees={assignees}
          />
        )}
      </ModalTransition>
    </div>
  );
};

export default IssuesPage;
