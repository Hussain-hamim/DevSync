"use client";

import { useState } from "react";
import {
  Users,
  Eye,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface AnalyticsSummary {
  total_sessions: number;
  total_page_views: number;
  unique_users: number;
  unique_pages: number;
  avg_time_spent: number;
  total_time_spent: number;
  views_24h: number;
  views_7d: number;
  views_30d: number;
}

interface TopPage {
  path: string;
  count: number;
  title: string;
  totalTime: number;
}

interface RecentVisitor {
  id: string;
  session_id: string;
  page_path: string;
  page_title: string | null;
  time_spent: number;
  created_at: string;
  device_type: string;
  browser: string;
  os: string;
  users: {
    name: string | null;
    email: string;
  } | null;
}

export default function VisitorAnalytics({
  analyticsSummary,
  topPages,
  recentVisitors,
  uniqueSessions,
}: {
  analyticsSummary: AnalyticsSummary | null;
  topPages: TopPage[];
  recentVisitors: RecentVisitor[];
  uniqueSessions: number;
}) {
  // Default values if analytics summary is null
  const summary = analyticsSummary || {
    total_sessions: uniqueSessions,
    total_page_views: 0,
    unique_users: 0,
    unique_pages: 0,
    avg_time_spent: 0,
    total_time_spent: 0,
    views_24h: 0,
    views_7d: 0,
    views_30d: 0,
  };
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getBrowserIcon = (browser: string) => {
    // Use Globe icon for all browsers since specific browser icons aren't available
    return <Globe className="w-4 h-4" />;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Visitor Analytics</h2>
        <p className="text-gray-400">
          Track who visits your website, where they go, and how long they stay
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["24h", "7d", "30d"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg transition ${
              timeRange === range
                ? "bg-emerald-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {range === "24h"
              ? "Last 24 Hours"
              : range === "7d"
              ? "Last 7 Days"
              : "Last 30 Days"}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-400">Unique Sessions</p>
          </div>
          <p className="text-3xl font-bold text-blue-400">
            {summary.total_sessions}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {timeRange === "24h"
              ? summary.views_24h
              : timeRange === "7d"
              ? summary.views_7d
              : summary.views_30d}{" "}
            views
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-gray-400">Total Page Views</p>
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {summary.total_page_views}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.unique_pages} unique pages
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-gray-400">Unique Visitors</p>
          </div>
          <p className="text-3xl font-bold text-emerald-400">
            {summary.unique_users}
          </p>
          <p className="text-xs text-gray-500 mt-1">Registered users</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-gray-400">Avg. Time Spent</p>
          </div>
          <p className="text-3xl font-bold text-yellow-400">
            {formatTime(Math.round(summary.avg_time_spent))}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatTime(summary.total_time_spent)} total
          </p>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Most Visited Pages</h3>
        <div className="space-y-3">
          {topPages.length > 0 ? (
            topPages.map((page, index) => (
              <div
                key={page.path}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{page.title}</div>
                    <div className="text-sm text-gray-400">{page.path}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-semibold">{page.count}</div>
                    <div className="text-xs text-gray-400">views</div>
                  </div>
                  <Link
                    href={page.path}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-emerald-400 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No page views yet</p>
          )}
        </div>
      </div>

      {/* Recent Visitors */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Visitors</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Visitor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Page
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Time Spent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Visited
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentVisitors.length > 0 ? (
                recentVisitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="hover:bg-gray-700/50 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {visitor.users ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                              {(visitor.users.name ||
                                visitor.users.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {visitor.users.name || "User"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {visitor.users.email}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center text-xs">
                              ?
                            </div>
                            <div className="text-sm text-gray-400">
                              Anonymous
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {visitor.page_title || visitor.page_path}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">
                        {visitor.page_path}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(visitor.device_type)}
                        <div className="text-sm">
                          <div>{visitor.device_type}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            {getBrowserIcon(visitor.browser)}
                            {visitor.browser} • {visitor.os}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatTime(visitor.time_spent)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(visitor.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No visitors yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
