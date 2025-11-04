"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Terminal, Menu, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import MyDropdownMenu from "./DropdownMenu";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { signOut } from "next-auth/react";

const Header = () => {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
        setMobileMenuOpen(false); // Close mobile menu on scroll down
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navItems = ["Projects", "Teams", "Rankings", "Profile"];

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full rounded-3xl z-50 bg-gray-800/90 backdrop-blur-md border-b border-gray-700"
        >
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                <Link href="/">DevSync</Link>
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item, index) => (
                <motion.a
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  href={"/" + item.toLowerCase()}
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            {/* Mobile Menu Button - Always visible on mobile */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="md:hidden p-2 rounded-lg hover:bg-gray-700/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5 text-gray-300" />
            </motion.button>

            {/* Desktop Auth Button/Dropdown */}
            <div className="hidden md:block">
              {session || user ? (
                <MyDropdownMenu />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 font-medium hover:opacity-90 transition-opacity"
                  >
                    Login
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden overflow-hidden"
              >
                <div className="px-6 pb-4 space-y-3">
                  {navItems.map((item) => (
                    <Link
                      key={item}
                      href={"/" + item.toLowerCase()}
                      className="block px-3 py-2 text-gray-300 hover:text-emerald-400 hover:bg-gray-700/50 rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  {session || user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-left rounded-md hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-rose-400">Log out</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full px-3 py-2 mt-2 text-center rounded-md bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 font-medium hover:opacity-90 transition-opacity"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;
