import type { IconType } from 'react-icons';
import {
  MdNewspaper, MdPhoneAndroid, MdEvent, MdHome, MdCheckCircle, MdStar,
  MdShield, MdAssignment, MdSearch, MdDelete, MdUpload, MdLock,
  MdDashboard, MdPeople, MdPerson, MdArticle, MdContacts, MdContentCut,
  MdSchedule, MdAccountBox, MdShare, MdMenu, MdClose, MdExpandMore,
  MdLogout, MdNotifications, MdRefresh,
} from 'react-icons/md';

export const ICONS = {
  // Landing features
  newspaper:   MdNewspaper,
  phone:       MdPhoneAndroid,
  event:       MdEvent,
  home:        MdHome,
  // Utility
  check:       MdCheckCircle,
  star:        MdStar,
  // LGPD
  shield:      MdShield,
  assignment:  MdAssignment,
  search:      MdSearch,
  delete:      MdDelete,
  upload:      MdUpload,
  lock:        MdLock,
  // Nav / dashboard
  dashboard:   MdDashboard,
  people:      MdPeople,
  person:      MdPerson,
  article:     MdArticle,
  contacts:    MdContacts,
  clipping:    MdContentCut,
  schedule:    MdSchedule,
  citizen:     MdAccountBox,
  social:      MdShare,
  // UI
  menu:        MdMenu,
  close:       MdClose,
  chevronDown: MdExpandMore,
  logout:      MdLogout,
  bell:        MdNotifications,
  refresh:     MdRefresh,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
}

export function Icon({ name, size = '1em', className, ...rest }: IconProps) {
  const Component: IconType = ICONS[name];
  return <Component size={size} className={className} {...rest} />;
}
