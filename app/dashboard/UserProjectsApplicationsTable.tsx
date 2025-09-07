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
import { DateTime } from 'luxon';
import { Applications } from '@/types/application';
import { CircleCheck, CircleX, EllipsisVertical, Loader } from 'lucide-react';
import Link from 'next/link';

const UserProjectsApplicationsTable = ({
  applications,
}: {
  applications: Applications;
}) => {
  return (
    <>
      <Table>
        <TableCaption>Eine Liste deiner aktuellen Nutzeranfragen.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Start
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Verein
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Skills
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Projekt
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'>
              Status
            </TableHead>
            <TableHead className='px-4 py-2 text-left whitespace-nowrap'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className='px-4 py-2 whitespace-nowrap hidden md:block'>
                {DateTime.fromISO(String(application.project.startingAt), {
                  zone: 'utc',
                })
                  .setZone('Europe/Berlin')
                  .toFormat('dd.LL.yyyy')}
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap md:hidden'>
                {DateTime.fromISO(String(application.project.startingAt), {
                  zone: 'utc',
                })
                  .setZone('Europe/Berlin')
                  .toFormat('dd.LL.')}
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap'>
                <Link href={`/ngos/${application.ngoId}`}>
                  {application.ngo.name}
                </Link>
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap'>
                {application.skills.map((s) => s.name).join(', ')}
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap'>
                <Link href={`/projects/${application.projectId}`}>
                  {application.project.name}
                </Link>
              </TableCell>
              <TableCell className='px-4 py-2 whitespace-nowrap'>
                <Badge
                  variant='outline'
                  className='text-muted-foreground px-1.5'
                >
                  {application.status === 'accepted' ? (
                    <CircleCheck className='fill-green-500 dark:fill-green-400' />
                  ) : application.status === 'rejected' ? (
                    <CircleX className='fill-red-500 dark:fill-red-400' />
                  ) : (
                    <Loader />
                  )}
                  {application.status === 'accepted' ? (
                    <span>akzeptiert</span>
                  ) : application.status === 'rejected' ? (
                    <span>abgelehnt</span>
                  ) : (
                    <span>ausstehend</span>
                  )}
                </Badge>
              </TableCell>
              {application.status !== 'rejected' && (
                <TableCell className='px-4 py-2 whitespace-nowrap'>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Badge variant='outline' className='py-1.5'>
                        <EllipsisVertical />
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className='text-red-500 dark:text-red-400 focus:bg-red-200 focus:text-red-500'>
                        Anfrage zurückziehen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default UserProjectsApplicationsTable;
