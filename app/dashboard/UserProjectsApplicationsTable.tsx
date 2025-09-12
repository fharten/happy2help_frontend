import BadgeComponent from '@/components/BadgeComponent';
import ButtonComponent from '@/components/ButtonComponent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
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
    <div className='w-full'>
      <div className='lg:bg-light-mint/10 backdrop-blur-xl rounded-[2rem] border border-light-mint/20 p-6 lg:p-10'>
        <h3 className='text-xl lg:text-2xl font-bold text-prussian mb-2 tracking-tight'>
          Deine Bewerbungen
        </h3>
        <p className='text-prussian/70 text-sm lg:text-base mb-8 font-medium'>
          Übersicht aller deiner Projektbewerbungen und deren Status.
        </p>

        {/* Mobile Card Layout */}
        <div className='block lg:hidden space-y-4'>
          {applications.map((application) => (
            <div
              key={application.id}
              className='bg-light-mint/10 border border-light-mint/30 rounded-2xl p-4 hover:bg-light-mint/15 transition-all duration-200'
            >
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                  <Link
                    href={`/projects/${application.projectId}`}
                    className='text-prussian hover:text-prussian/80 font-semibold text-lg transition-colors duration-200 block mb-1'
                  >
                    {application.project.name}
                  </Link>
                  <div className='flex items-center gap-2 text-sm text-prussian/70 mb-1'>
                    <span>Start:</span>
                    <span className='font-medium'>
                      {DateTime.fromISO(
                        String(application.project.startingAt),
                        {
                          zone: 'utc',
                        }
                      )
                        .setZone('Europe/Berlin')
                        .toFormat('dd.LL.yyyy')}
                    </span>
                  </div>
                  <Link
                    href={`/ngos/${application.ngo.id}`}
                    className='text-prussian/70 hover:text-prussian text-sm transition-colors duration-200'
                  >
                    {application.ngo.name}
                  </Link>
                </div>
                {application.status !== 'rejected' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <ButtonComponent variant='action' size='sm'>
                        <EllipsisVertical size={16} />
                      </ButtonComponent>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='bg-white/95 backdrop-blur-xl border-light-mint/30 shadow-2xl rounded-2xl p-2'>
                      <DropdownMenuItem className='text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200 p-3'>
                        Anfrage zurückziehen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className='space-y-3'>
                <div>
                  <div className='text-prussian/60 text-xs font-medium mb-1 uppercase tracking-wide'>
                    Deine Skills
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {application.skills.slice(0, 4).map((skill) => (
                      <BadgeComponent key={skill.id} variant='skill' size='sm'>
                        {skill.name}
                      </BadgeComponent>
                    ))}
                    {application.skills.length > 4 && (
                      <BadgeComponent variant='count' size='sm'>
                        +{application.skills.length - 4}
                      </BadgeComponent>
                    )}
                  </div>
                </div>

                <div className='flex justify-between items-center pt-2 border-t border-light-mint/20'>
                  <div className='text-prussian/60 text-xs font-medium uppercase tracking-wide'>
                    Status
                  </div>
                  <BadgeComponent
                    variant={
                      application.status === 'accepted'
                        ? 'success'
                        : application.status === 'rejected'
                        ? 'error'
                        : 'warning'
                    }
                    size='md'
                    className={`flex items-center gap-2 w-fit`}
                  >
                    {application.status === 'accepted' ? (
                      <CircleCheck size={14} className='fill-green-500' />
                    ) : application.status === 'rejected' ? (
                      <CircleX size={14} className='fill-red-500' />
                    ) : (
                      <Loader size={14} className='animate-spin' />
                    )}
                    {application.status === 'accepted' ? (
                      <span>Akzeptiert</span>
                    ) : application.status === 'rejected' ? (
                      <span>Abgelehnt</span>
                    ) : (
                      <span>Ausstehend</span>
                    )}
                  </BadgeComponent>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className='hidden lg:block overflow-x-auto'>
          <Table className='min-w-full'>
            <TableHeader>
              <TableRow className='border-b border-light-mint/30 hover:bg-light-mint/10'>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Start
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Verein
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Skills
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Projekt
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Status
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow
                  key={application.id}
                  className='border-b border-light-mint/20 hover:bg-light-mint/5 transition-all duration-200'
                >
                  <TableCell className='px-6 py-5 whitespace-nowrap text-prussian font-medium'>
                    {DateTime.fromISO(String(application.project.startingAt), {
                      zone: 'utc',
                    })
                      .setZone('Europe/Berlin')
                      .toFormat('dd.LL.yyyy')}
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <Link
                      href={`/ngos/${application.ngo.id}`}
                      className='text-prussian hover:text-prussian/80 font-semibold transition-colors duration-200'
                    >
                      {application.ngo.name}
                    </Link>
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <div className='flex flex-wrap gap-1'>
                      {application.skills.slice(0, 3).map((skill) => (
                        <BadgeComponent
                          key={skill.id}
                          variant='skill'
                          size='sm'
                        >
                          {skill.name}
                        </BadgeComponent>
                      ))}
                      {application.skills.length > 3 && (
                        <BadgeComponent variant='count' size='sm'>
                          +{application.skills.length - 3}
                        </BadgeComponent>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <Link
                      href={`/projects/${application.projectId}`}
                      className='text-prussian hover:text-prussian/80 font-semibold transition-colors duration-200'
                    >
                      {application.project.name}
                    </Link>
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <BadgeComponent
                      variant={
                        application.status === 'accepted'
                          ? 'success'
                          : application.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                      size='md'
                      className={`flex items-center gap-2 w-fit`}
                    >
                      {application.status === 'accepted' ? (
                        <CircleCheck size={16} className='fill-green-500' />
                      ) : application.status === 'rejected' ? (
                        <CircleX size={16} className='fill-red-500' />
                      ) : (
                        <Loader size={16} className='animate-spin' />
                      )}
                      {application.status === 'accepted' ? (
                        <span>Akzeptiert</span>
                      ) : application.status === 'rejected' ? (
                        <span>Abgelehnt</span>
                      ) : (
                        <span>Ausstehend</span>
                      )}
                    </BadgeComponent>
                  </TableCell>
                  {application.status !== 'rejected' && (
                    <TableCell className='px-6 py-5 whitespace-nowrap'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <ButtonComponent variant='action' size='sm'>
                            <EllipsisVertical size={16} />
                          </ButtonComponent>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='bg-white/95 backdrop-blur-xl border-light-mint/30 shadow-2xl rounded-2xl p-2'>
                          <DropdownMenuItem className='text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200 p-3'>
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
        </div>
      </div>
    </div>
  );
};

export default UserProjectsApplicationsTable;
