import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Projects } from '@/types/project';
import { EllipsisVertical } from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';

const NgoProjectsTable = ({ projects }: { projects: Projects }) => {
  return (
    <div className='w-full overflow-x-auto'>
      <Table className='min-w-full border-collapse'>
        <TableCaption>Eine Liste deiner aktuellen Projekte.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Start
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Titel
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Gesucht
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Anfragen
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className='px-4 py-2 whitespace-nowrap md:hidden'>
                {DateTime.fromISO(String(project.startingAt), {
                  zone: 'utc',
                })
                  .setZone('Europe/Berlin')
                  .toFormat('dd.LL.')}
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap hidden md:block'>
                {DateTime.fromISO(String(project.startingAt), {
                  zone: 'utc',
                })
                  .setZone('Europe/Berlin')
                  .toFormat('dd.LL.yyyy')}
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap'>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap'>
                {project.skills.map((s) => s.name).join(', ')}
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap'>
                {project.stats?.totalApplications}
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap'>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Badge variant='outline' className='py-1.5'>
                      <EllipsisVertical />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {/* <DropdownMenuLabel>Bearbeiten</DropdownMenuLabel>
                    <DropdownMenuSeparator /> */}
                    <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                    <DropdownMenuItem className='text-red-500 dark:text-red-400 focus:bg-red-200 focus:text-red-500'>
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default NgoProjectsTable;
