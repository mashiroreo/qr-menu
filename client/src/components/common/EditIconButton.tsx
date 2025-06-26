import { IconButton, IconButtonProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export const EditIconButton = (props: IconButtonProps) => (
  <IconButton aria-label={props['aria-label'] ?? '編集'} sx={{ alignSelf: 'flex-start', ...props.sx }} {...props}>
    <EditIcon />
  </IconButton>
); 