import { Link } from "wouter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type BreadcrumbTrailItem = {
  label: string;
  href?: string;
};

export function buildBreadcrumbTrail(
  currentPage: string,
  parent?: { label: string; href: string }
): BreadcrumbTrailItem[] {
  return [
    { label: "Home", href: "/" },
    ...(parent ? [parent] : []),
    { label: currentPage },
  ];
}

export function PageBreadcrumbs({ items }: { items: BreadcrumbTrailItem[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isCurrentPage = index === items.length - 1;
          return (
            <BreadcrumbItem key={`${item.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              {isCurrentPage || !item.href ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
