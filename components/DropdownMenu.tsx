// components/ProfileDropdown.tsx
"use client";

import {
  DropdownMenu as RadixDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/utils/dropdownMenu";
import { motion } from "framer-motion";
import {
  ChevronDown,
  User,
  CreditCard,
  Users,
  Zap,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const ProfileDropdown = () => {
  const router = useRouter();

  return (
    <RadixDropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Menu
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: 180 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg shadow-black/50"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-sm font-medium text-emerald-400 flex items-center gap-2">
          <User className="w-4 h-4" />
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700 h-[1px] my-1" />

        <DropdownMenuItem
          className="px-2 py-1.5 text-sm rounded-md focus:bg-gray-700/50 focus:text-emerald-400 outline-none cursor-pointer transition-colors"
          onClick={() => router.push("/profile")}
        >
          <motion.div whileHover={{ x: 2 }} className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Profile
          </motion.div>
        </DropdownMenuItem>

        <DropdownMenuItem className="px-2 py-1.5 text-sm rounded-md focus:bg-gray-700/50 focus:text-emerald-400 outline-none cursor-pointer transition-colors">
          <motion.div whileHover={{ x: 2 }} className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            Billing
          </motion.div>
        </DropdownMenuItem>

        <DropdownMenuItem className="px-2 py-1.5 text-sm rounded-md focus:bg-gray-700/50 focus:text-emerald-400 outline-none cursor-pointer transition-colors">
          <motion.div whileHover={{ x: 2 }} className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            Team
          </motion.div>
        </DropdownMenuItem>

        <DropdownMenuItem className="px-2 py-1.5 text-sm rounded-md focus:bg-gray-700/50 focus:text-emerald-400 outline-none cursor-pointer transition-colors">
          <motion.div whileHover={{ x: 2 }} className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-400" />
            Subscription
          </motion.div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700 h-[1px] my-1" />
        <DropdownMenuItem className="px-2 py-1.5 text-sm rounded-md focus:bg-gray-700/50 focus:text-rose-400 outline-none cursor-pointer transition-colors">
          <motion.div
            whileHover={{ x: 2 }}
            className="flex items-center gap-2 text-rose-400"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </motion.div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </RadixDropdownMenu>
  );
};

export default ProfileDropdown;
