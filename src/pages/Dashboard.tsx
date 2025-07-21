import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  activeMissions: number;
  totalMissions: number;
  upcomingMissions: number;
}

interface Mission {
  id: string;
  title: string;
  location_address: string;
  start_date_time: string;
  end_date_time: string;
  workers_needed: number;
  status: string;
  registrations?: any[];
}

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeMissions: 0,
    totalMissions: 0,
    upcomingMissions: 0,
  });
  const [recentMissions, setRecentMissions] = useState<Mission[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') {
        fetchAdminStats();
      } else {
        fetchEmployeeData();
      }
    }
  }, [profile]);

  const fetchAdminStats = async () => {
    try {
      // Get total employees
      const { count: employeeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'employee');

      // Get mission statistics
      const { data: missions } = await supabase
        .from('missions')
        .select(`
          *,
          mission_registrations(*)
        `);

      const activeMissions = missions?.filter(m => m.status === 'active') || [];
      const upcomingMissions = missions?.filter(m => 
        m.status === 'active' && new Date(m.start_date_time) > new Date()
      ) || [];

      setStats({
        totalEmployees: employeeCount || 0,
        activeMissions: activeMissions.length,
        totalMissions: missions?.length || 0,
        upcomingMissions: upcomingMissions.length,
      });

      setRecentMissions(missions?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      // Get user's registered missions
      const { data: registrations } = await supabase
        .from('mission_registrations')
        .select(`
          *,
          missions(*)
        `)
        .eq('user_id', user?.id);

      const userMissions = registrations?.map(r => r.missions).filter(Boolean) || [];
      
      // Get available missions
      const { data: availableMissions } = await supabase
        .from('missions')
        .select(`
          *,
          mission_registrations(*)
        `)
        .eq('status', 'active')
        .gte('start_date_time', new Date().toISOString())
        .limit(3);

      setUserRegistrations(userMissions);
      setRecentMissions(availableMissions || []);

      setStats({
        totalEmployees: 0,
        activeMissions: userMissions.filter(m => m.status === 'active').length,
        totalMissions: userMissions.length,
        upcomingMissions: userMissions.filter(m => 
          new Date(m.start_date_time) > new Date()
        ).length,
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'draft': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-muted rounded-lg"></div>
              <div className="h-24 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.first_name}!
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'admin' 
              ? 'Manage your distribution operations' 
              : 'Find and join missions in your area'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {profile?.role === 'admin' ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                      <p className="text-xs text-muted-foreground">Employees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeMissions}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.upcomingMissions}</p>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalMissions}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeMissions}</p>
                      <p className="text-xs text-muted-foreground">My Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.upcomingMissions}</p>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {profile?.role === 'admin' ? (
                <>
                  <Button 
                    className="h-12 flex-col gap-1" 
                    onClick={() => window.location.href = '/missions/create'}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs">New Mission</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 flex-col gap-1"
                    onClick={() => window.location.href = '/employees'}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-xs">View Employees</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="h-12 flex-col gap-1"
                    onClick={() => window.location.href = '/browse'}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">Browse Missions</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 flex-col gap-1"
                    onClick={() => window.location.href = '/profile'}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-xs">My Profile</span>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent/Available Missions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {profile?.role === 'admin' ? 'Recent Missions' : 'Available Missions'}
            </CardTitle>
            <CardDescription>
              {profile?.role === 'admin' 
                ? 'Latest created missions'
                : 'Missions you can join'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMissions.length > 0 ? (
                recentMissions.map((mission) => (
                  <div key={mission.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{mission.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(mission.status)}`}>
                        {mission.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {mission.location_address}
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{formatDate(mission.start_date_time)}</span>
                      <span>{mission.workers_needed} workers needed</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No missions available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;