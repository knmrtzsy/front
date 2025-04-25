import React from 'react';
import { NavLink } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, CalendarIcon, UserGroupIcon, AcademicCapIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Sınıflar', to: '/siniflar', icon: UserGroupIcon },
  { name: 'Öğretmenler', to: '/ogretmenler', icon: AcademicCapIcon },
  { name: 'Dersler', to: '/dersler', icon: BookOpenIcon },
  { name: 'Program', to: '/zamanlama', icon: ClockIcon },
];

const navStyle = {
  background: 'linear-gradient(to right, #00100e, #007f6b)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  height: '3rem',
};

const logoStyle = {
  fontSize: '1rem',
  fontWeight: 'bold',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
};

const navItemStyle = {
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white',
  padding: '0.25rem 0.5rem',
  display: 'inline-flex',
  alignItems: 'center',
  borderBottomWidth: '2px',
  borderBottomColor: 'transparent',
};

const navItemActiveStyle = {
  ...navItemStyle,
  borderBottomColor: 'white',
  fontWeight: 'bold',
};

const iconStyle = {
  width: '0.875rem',
  height: '0.875rem',
  marginRight: '0.25rem',
};

const menuButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.375rem',
  padding: '0.375rem',
  color: 'rgba(255, 255, 255, 0.8)',
};

export default function NavBar() {
  return (
    <Disclosure as="nav" style={navStyle}>
      {({ open }) => (
        <>
          <div style={{ maxWidth: '80rem', padding: '0 0.5rem', margin: '0 auto' }}>
            <div style={{ display: 'flex', height: '3rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <NavLink to="/" style={logoStyle}>
                    <CalendarIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.375rem', color: 'white' }} aria-hidden="true" />
                    <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>Ders Programı</span>
                  </NavLink>
                </div>
                <div style={{ display: window.innerWidth < 640 ? 'none' : 'flex', marginLeft: '1.5rem', gap: '1rem' }}>
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      style={({ isActive }) => isActive ? navItemActiveStyle : navItemStyle}
                    >
                      <item.icon style={iconStyle} aria-hidden="true" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
              
              <div style={{ display: window.innerWidth < 640 ? 'flex' : 'none', alignItems: 'center', marginRight: '-0.25rem' }}>
                <Disclosure.Button style={menuButtonStyle}>
                  <span style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }}>Ana menüyü aç</span>
                  {open ? (
                    <XMarkIcon style={{ width: '1.25rem', height: '1.25rem' }} aria-hidden="true" />
                  ) : (
                    <Bars3Icon style={{ width: '1.25rem', height: '1.25rem' }} aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel style={{ display: window.innerWidth < 640 ? 'block' : 'none' }}>
            <div style={{ paddingBottom: '0.5rem', paddingTop: '0.25rem' }}>
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    borderLeftWidth: '4px',
                    borderLeftColor: isActive ? 'white' : 'transparent',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.8)' : 'transparent',
                    padding: '0.5rem 0.5rem 0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'white',
                  })}
                >
                  <item.icon style={{ width: '1rem', height: '1rem', marginRight: '0.375rem' }} aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
