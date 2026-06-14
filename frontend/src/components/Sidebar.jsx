import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  FileImage, 
  Activity, 
  Bot, 
  HelpCircle, 
  LogOut, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to log out of MedVision AI?')) {
      window.location.href = '/';
    }
  };

  const menuGroups = [
    {
      id: 'general',
      title: 'General',
      items: [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      id: 'clinical',
      title: 'Clinical Tools',
      items: [
        { name: 'X-Ray Analysis', path: '/xray', icon: FileImage },
        { name: 'Risk Prediction', path: '/risk', icon: Activity },
        { name: 'MedBot Chat', path: '/chat', icon: Bot },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : 'sidebar--expanded'}`}>
      {/* Top Header Section */}
      <div className="sidebar-top">
        {!isCollapsed && (
          <div className="sidebar-avatar-wrapper">
            <div className="sidebar-avatar">
              MV
            </div>
            <div className="sidebar-avatar-info">
              <span className="sidebar-avatar-name">Clinician Admin</span>
              <span className="sidebar-avatar-role">MedVision Staff</span>
            </div>
          </div>
        )}
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar} 
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>

      {/* Middle Menu Section */}
      <nav className="sidebar-menu">
        {menuGroups.map((group) => (
          <React.Fragment key={group.id}>
            <div className="sidebar-separator">{group.title}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    isActive ? 'sidebar-item active' : 'sidebar-item'
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="sidebar-item-icon">
                    <Icon size={20} />
                  </span>
                  <span className="sidebar-item-label">{item.name}</span>
                </NavLink>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Bottom Pinned Section */}
      <div className="sidebar-bottom">
        {/* Help Center Item */}
        <NavLink
          to="/contact"
          className={({ isActive }) => 
            isActive ? 'sidebar-item active' : 'sidebar-item'
          }
          title={isCollapsed ? "Help Center" : undefined}
        >
          <span className="sidebar-item-icon">
            <HelpCircle size={20} />
          </span>
          <span className="sidebar-item-label">Help Center</span>
        </NavLink>

        {/* Logout Item */}
        <a
          href="#logout"
          onClick={handleLogout}
          className="sidebar-item"
          title={isCollapsed ? "Logout" : undefined}
        >
          <span className="sidebar-item-icon">
            <LogOut size={20} style={{ color: 'var(--danger)' }} />
          </span>
          <span className="sidebar-item-label" style={{ color: 'var(--danger)' }}>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
