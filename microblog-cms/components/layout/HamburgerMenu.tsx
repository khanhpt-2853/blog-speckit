"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button - visible on mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 lg:hidden"
        aria-label="Open filters and menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <>
          <div
            className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto bg-gray-50 p-6 shadow-xl lg:hidden">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-2 hover:bg-gray-200"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <Sidebar showFilters onFilterClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
