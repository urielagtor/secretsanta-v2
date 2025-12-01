import { t } from "i18next";
import { MenuItem, SideMenu } from "./SideMenu";

export type LayoutProps = {
  menuItems: React.ReactNode[];
  children: React.ReactNode;
};

export function Layout({ menuItems, children }: LayoutProps) {
  return (
    <div className="min-h-screen flex lg:items-center justify-center p-4 lg:overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <SideMenu>
          {menuItems}
        </SideMenu>

        <div className="mt-2 md:mt-4 ml-4 md:ml-12 flex flex-col justify-around lg:flex-row gap-12 md:gap-16">
          {children}
        </div>
      </div>
    </div>
  );
}
