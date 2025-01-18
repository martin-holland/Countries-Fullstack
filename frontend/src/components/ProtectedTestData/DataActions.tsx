import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Tooltip } from "@mui/material";
import { TestData } from "../../types/test";

interface DataActionsProps {
  row: TestData;
  onEdit: (data: TestData) => void;
  onDelete: () => void;
}

export const DataActions = ({ row, onEdit, onDelete }: DataActionsProps) => {
  return (
    <>
      <Tooltip title="Edit">
        <IconButton onClick={() => onEdit(row)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};
