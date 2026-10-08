'use client';

import Link from 'next/link';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { icons } from './icons';
import { usePathname } from 'next/navigation';

const navLinks = [
  { path: '/order', icon: icons.order, label: 'Order' },
  { path: '/order-history', icon: icons.history, label: 'Order History' },
  {
    path: '/products',
    icon: icons.products,
    label: 'Products',
    submenu: [
      { path: '', icon: icons.productsAll, label: 'All Products' },
      { path: '/categories', icon: icons.categories, label: 'Categories' },
      { path: '/inventory', icon: icons.warehouse, label: 'Inventory' },
    ],
  },
  { path: '/employee', icon: icons.employee, label: 'Employee' },
  { path: '/report', icon: icons.report, label: 'Report' },
];

interface Props {
  isMinimized: boolean;
  setIsMinimized: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ isMinimized, setIsMinimized }: Props) {
  const [isProductMenuVisible, setIsProductMenuVisible] = useState(false);
  const path = usePathname();
  console.log('path', path);
  const isActivePath = (link: string, useInclude?: boolean) => {
    if (useInclude) return path.includes(link);
    return link === path;
  };

  const handleProductMenu = () => {
    setIsProductMenuVisible((prev) => !prev);
  };

  const handleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleMinimizeUncollapsed = () => {
    if (isMinimized) {
      setIsProductMenuVisible(false);
    }
  };

  //  <aside
  //       className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col bg-stone-900 text-white transition-transform duration-300 ${
  //         isOpen ? 'translate-x-0' : '-translate-x-full'
  //       } md:translate-x-0`}
  //     ></aside>

  // useEffect(() => {

  // }, [path])

  return (
    <aside
      className={`
        sticky top-0
        flex h-screen flex-col shrink-0 bg-white
        transition-all duration-300
        ${isMinimized ? 'w-20' : 'w-64'}
        shadow-[5px_0_10px_-3px_rgba(0,0,0,0.1)]
      `}
    >
      <nav
        className="h-full flex flex-col items-center"
        aria-label="sidebar navigation"
      >
        <section
          className={`flex flex-col justify-center items-center gap-4 ${!isMinimized ? 'my-10' : 'my-20.5'}`}
        >
          {!isMinimized && <p className="text-3xl">Coffee Shop</p>}
          <img
            src="/coffee.png"
            alt="coffee"
            className={`${isMinimized ? 'w-16 h-16' : 'w-24 h-24'}`}
          />
        </section>

        <ul className="space-y-1 w-full">
          {navLinks.map((item) =>
            !item?.submenu ? (
              <li key={item.label} className={`w-full px-3`}>
                <Link
                  title={item.label}
                  onClick={handleMinimizeUncollapsed}
                  href={item.path}
                  className={`flex gap-2 rounded-md px-4 py-3 ${isMinimized && 'justify-center'} hover:bg-amber-100 hover:text-amber-700 ${isActivePath(item.path) ? 'bg-amber-100 text-amber-700' : 'text-gray-700'}`}
                >
                  {item.icon} {!isMinimized && item.label}
                </Link>
              </li>
            ) : (
              <li key={item.label} className={'w-full'}>
                {isMinimized ? (
                  <div className="relative">
                    <span className="flex gap-2 px-3">
                      <button
                        title={item.label}
                        type="button"
                        aria-expanded={isProductMenuVisible}
                        aria-controls="product-menu"
                        onClick={handleProductMenu}
                        className={`w-full text-left flex cursor-pointer rounded-md px-4 py-3 hover:bg-amber-100 hover:text-amber-700 ${isActivePath(item.path, true) ? 'bg-amber-100 text-amber-700' : 'text-gray-700'} ${isMinimized ? 'justify-center' : 'justify-between'}`}
                      >
                        <span className="flex gap-2">
                          {icons.products} {!isMinimized && item.label}
                        </span>
                      </button>
                    </span>

                    {isProductMenuVisible && (
                      <div className="absolute left-full top-0 ml-2 w-48 rounded-lg border-slate-200 bg-white p-2 shadow-lg">
                        <div className="px-3 py-2 text-sm font-medium text-slate-800">
                          Products
                        </div>
                        <div className="my-1 border border-slate-100" />
                        {item.submenu.map((sub) => {
                          const isActive = isActivePath(item.path + sub.path);

                          return (
                            <Link
                              title={sub.label}
                              onClick={handleMinimizeUncollapsed}
                              key={sub.label}
                              href={item.path + sub.path}
                              className={`
                                flex items-center gap-3
                                rounded-md px-3 py-2
                                text-sm
                                transition-colors
                                ${
                                  isActive
                                    ? 'bg-amber-50 font-medium text-amber-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }
                              `}
                            >
                              {sub.icon}
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="flex gap-2 px-3">
                      <button
                        type="button"
                        aria-expanded={isProductMenuVisible}
                        aria-controls="product-menu"
                        onClick={handleProductMenu}
                        className={`w-full text-left flex cursor-pointer rounded-md px-4 py-3 hover:bg-amber-100 hover:text-amber-700 ${isActivePath(item.path, true) ? 'bg-amber-100 text-amber-700' : 'text-gray-700'} ${isMinimized ? 'justify-center' : 'justify-between'}`}
                      >
                        <span className="flex gap-2">
                          {icons.products} {!isMinimized && item.label}
                        </span>
                        {!isMinimized && icons.arrowDown}
                      </button>
                    </span>

                    {isProductMenuVisible && (
                      <ul
                        id="product-menu"
                        className="ml-6 mt-1 border-l border-slate-200 pl-3 space-y-1"
                      >
                        {item.submenu.map((sub) => {
                          const isActive = isActivePath(item.path + sub.path);

                          return (
                            <li key={sub.label}>
                              <Link
                                onClick={handleMinimizeUncollapsed}
                                href={item.path + sub.path}
                                className={`
                              flex items-center gap-3
                              rounded-md
                              pl-3 pr-5 py-2
                              text-sm
                              transition-colors
                              hover:cursor-pointer
                              ${
                                isActive
                                  ? 'text-amber-700 font-medium'
                                  : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }
                            `}
                              >
                                {sub.icon}
                                <span>{sub.label}</span>

                                {isActive && (
                                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-600" />
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ),
          )}
        </ul>

        <div className="w-full mt-auto p-3">
          <button
            className="flex gap-3 w-full rounded-md px-4 py-3
               text-slate-700 transition-colors
               hover:bg-amber-100 hover:text-amber-700
               cursor-pointer"
            onClick={handleMinimize}
          >
            {icons.chevron} {!isMinimized && 'Collapse'}
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-md px-4 py-3
               text-slate-700 transition-colors
               hover:bg-amber-100 hover:text-amber-700
               cursor-pointer"
          >
            {icons.logout}
            {!isMinimized && 'Logout'}
          </button>
        </div>
      </nav>
    </aside>
  );
}
