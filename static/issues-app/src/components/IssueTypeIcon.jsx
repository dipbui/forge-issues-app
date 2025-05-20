import Bug16Icon from "@atlaskit/icon-object/glyph/bug/16";
import Task16Icon from "@atlaskit/icon-object/glyph/task/16";
import Story16Icon from "@atlaskit/icon-object/glyph/story/16";
import Subtask16Icon from "@atlaskit/icon-object/glyph/subtask/16";
import Epic16Icon from "@atlaskit/icon-object/glyph/epic/16";

export const IssueTypeIcon = ({ type }) => {
  const iconProps = {
    size: "small",
    primaryColor: "#42526E",
  };

  switch (type.toLowerCase()) {
    case "bug":
      return <Bug16Icon {...iconProps} primaryColor="#FF5630" />;
    case "task":
      return <Task16Icon {...iconProps} primaryColor="#0052CC" />;
    case "story":
      return <Story16Icon {...iconProps} primaryColor="#36B37E" />;
    case "sub-task":
      return <Subtask16Icon {...iconProps} primaryColor="#00B8D9" />;
    case "epic":
      return <Epic16Icon {...iconProps} primaryColor="#6554C0" />;
    default:
      return <Task16Icon {...iconProps} />;
  }
};
