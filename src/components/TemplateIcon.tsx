import React from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ScienceIcon from '@mui/icons-material/Science';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BookIcon from '@mui/icons-material/Book';
import RestaurantIcon from '@mui/icons-material/Restaurant';

interface TemplateIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

const TemplateIcon: React.FC<TemplateIconProps> = ({ iconName, className, size = 20 }) => {
  const iconProps = {
    className,
    sx: { fontSize: size }
  };

  switch (iconName) {
    case 'Description':
      return <DescriptionIcon {...iconProps} />;
    case 'EditNote':
      return <EditNoteIcon {...iconProps} />;
    case 'CheckBox':
      return <CheckBoxIcon {...iconProps} />;
    case 'Science':
      return <ScienceIcon {...iconProps} />;
    case 'Analytics':
      return <AnalyticsIcon {...iconProps} />;
    case 'Book':
      return <BookIcon {...iconProps} />;
    case 'Restaurant':
      return <RestaurantIcon {...iconProps} />;
    default:
      return <DescriptionIcon {...iconProps} />;
  }
};

export default TemplateIcon;
