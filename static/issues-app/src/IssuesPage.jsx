import React, { useState } from "react";
import { ModalTransition } from "@atlaskit/modal-dialog";
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
import { invoke } from "@forge/bridge";

const statusOptions = [
  { label: "To Do", value: "To Do" },
  { label: "In Progress", value: "In Progress" },
  { label: "Done", value: "Done" },
];

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

  const error = projectsError || issuesError;

  const handleDelete = async (issueId) => {
    try {
      await invoke("deleteIssue", { issueId });
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
      setApiCallError("Failed to delete issue.");
    }
  };

  const handleUpdateSubmit = async (updatePayload) => {
    try {
      await invoke("updateIssue", updatePayload);

      const updatedIssues = issues.map((issue) =>
        issue.id === currentIssue.id
          ? {
              ...issue,
              summary: updatePayload.fields.summary,
              description: updatePayload.fields.description,
              status: updatePayload.fields.status,
              assignee: updatePayload.fields.assignee?.label || "",
              assigneeAccountId: updatePayload.fields.assignee?.value || "",
            }
          : issue
      );

      setListIssues(updatedIssues);
      setIsUpdateModalOpen(false);
    } catch (err) {
      console.error("Update error details:", err);
      setApiCallError(`Failed to update issue: ${err.message}`);
    }
  };

  const pages = Array.from({ length: Math.ceil(total / 5) }, (_, i) => i + 1);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>Issues</h2>
      {error && <div style={{ color: "#FF5630" }}>{error}</div>}
      {isLoadingProjects && <div>Loading projects...</div>}
      {!isLoadingProjects && projects.length === 0 && !error && (
        <div>No projects available.</div>
      )}

      <DropdownMenu
        trigger={
          isLoadingProjects
            ? "Loading..."
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

      {selectedProject && (
        <>
          <IssuesTable
            issues={issues}
            isLoading={isLoadingIssues}
            onUpdate={(issue) => {
              setCurrentIssue(issue);
              setIsUpdateModalOpen(true);
            }}
            onDelete={handleDelete}
          />

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
