import Lozenge from "@atlaskit/lozenge";

export const StatusBadge = ({ status }) => {
  const statusAppearance = {
    "to do": "default",
    "in progress": "inprogress",
    done: "success",
  };

  const normalizedStatus = status.toLowerCase();
  const appearance = statusAppearance[normalizedStatus] || "default";

  return (
    <Lozenge appearance={appearance} isBold>
      {status}
    </Lozenge>
  );
};
