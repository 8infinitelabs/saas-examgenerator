import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

export const Logo = ({ size, color }: { size: string, color?: string }) => {
  const logoColor = color || 'warning';
  return (
    //@ts-ignore
    <LocalFireDepartmentIcon color={logoColor} fontSize={size} />
  );
}
