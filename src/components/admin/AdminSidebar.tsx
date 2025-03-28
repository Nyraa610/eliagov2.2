
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, BarChart3, BookOpen, FileText, Home, Settings, ShieldCheck, User, Users, Globe, Database } from 'lucide-react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenuItem, SidebarMenu } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

export function AdminSidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  
  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="h-screen border-r">
      <SidebarHeader className="flex-col items-start pl-4 pt-2">
        <div className="flex items-center gap-2 pb-2">
          <img 
            src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
            alt="Logo" 
            className="h-8 w-8" 
          />
          <span className="font-bold text-lg text-primary">ELIA GO</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('admin.adminPanel')}
        </span>
      </SidebarHeader>
      <SidebarContent className="px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/admin/panel" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActivePath('/admin/panel') && !isActivePath('/admin/panel/') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
              <Home className="h-4 w-4" />
              <span>{t('admin.overview')}</span>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link to="/admin/users" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActivePath('/admin/users') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
              <Users className="h-4 w-4" />
              <span>{t('admin.users')}</span>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link to="/admin/training" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActivePath('/admin/training') || isActivePath('/admin/courses') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
              <BookOpen className="h-4 w-4" />
              <span>{t('admin.training')}</span>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link to="/admin/translations" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActivePath('/admin/translations') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
              <Globe className="h-4 w-4" />
              <span>{t('admin.translations.title', 'Translations')}</span>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link to="/admin/emission-factors" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActivePath('/admin/emission-factors') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
              <Database className="h-4 w-4" />
              <span>Emission Factors</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <ArrowUpRight className="h-4 w-4" />
              <span>{t('admin.backToDashboard')}</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
