import React, { useState } from "react";
import { Rows, Row, Cell } from "@atlaskit/table-tree";
import Button from "@atlaskit/button/new";
import Avatar from "@atlaskit/avatar";
import { IssueTypeIcon } from "./IssueTypeIcon";
import { StatusBadge } from "./StatusBadge";

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#172B4D",
            color: "white",
            padding: "4px 8px",
            borderRadius: "3px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            zIndex: 1000,
            marginTop: "4px",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
export const IssuesTable = ({ issues, isLoading, onUpdate, onDelete }) => {
  if (isLoading) {
    return (
      <Row>
        <Cell colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
          Loading issues...
        </Cell>
      </Row>
    );
  }

  if (issues.length === 0) {
    return (
      <Row>
        <Cell colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
          No issues found.
        </Cell>
      </Row>
    );
  }

  return (
    <Rows
      items={issues}
      render={({
        id,
        type,
        key,
        summary,
        status,
        assignee,
        description,
        children = [],
      }) => (
        <Row itemId={id} items={children} hasChildren={children.length > 0}>
          <Cell>
            <div>
              <IssueTypeIcon type={type} />
            </div>
          </Cell>
          <Cell>
            <span style={{ color: "#0052CC", fontWeight: 500 }}>{key}</span>
          </Cell>
          <Cell>
            <StatusBadge status={status} />
          </Cell>
          <Cell>
            <Tooltip content={assignee || "Unassigned"}>
              <Avatar
                name={assignee || "Unassigned"}
                size="small"
                appearance="circle"
              />
            </Tooltip>
          </Cell>
          <Cell>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                onClick={() =>
                  onUpdate({
                    id,
                    type,
                    key,
                    summary,
                    status,
                    assignee,
                    description,
                  })
                }
                appearance="discovery"
              >
                Update
              </Button>
              <Button
                onClick={() => onDelete(id)}
                appearance="danger"
                style={{ color: "#FF5630" }}
              >
                Delete
              </Button>
            </div>
          </Cell>
        </Row>
      )}
    />
  );
};
