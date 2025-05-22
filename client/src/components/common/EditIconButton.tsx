import { IconButton, IconButtonProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export const EditIconButton = (props: IconButtonProps) => (
  <IconButton sx={{ alignSelf: 'flex-start', ...props.sx }} {...props}>
    <EditIcon />
  </IconButton>
); 