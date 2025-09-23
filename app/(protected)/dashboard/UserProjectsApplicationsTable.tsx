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
import {
  ApplicationWithdrawButton,
  ApplicationWithdrawButtonMobile,
} from './UserApplicationWithdrawButton';

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
          Übersicht all deiner Projektbewerbungen und deren Status.
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
              </div>

              <div className='space-y-3'>
                <div>
                  <div className='text-prussian/60 text-xs font-medium mb-1 uppercase tracking-wide'>
                    Deine Fähigkeiten
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

                <div className='flex flex-col gap-3 pt-2 border-t border-light-mint/20'>
                  <div className='flex flex-col gap-2'>
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
                      className='px-2 py-1 rounded-full font-medium text-xs flex items-center gap-1 w-fit'
                    >
                      {application.status === 'accepted' ? (
                        <CircleCheck size={14} className='fill-green-500' />
                      ) : application.status === 'rejected' ? (
                        <CircleX size={14} className='fill-red-500' />
                      ) : (
                        <Loader size={14} />
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
                  {application.status !== 'rejected' && (
                    <div className='flex justify-start'>
                      <ApplicationWithdrawButtonMobile
                        applicationId={application.id}
                      >
                        Abbrechen
                      </ApplicationWithdrawButtonMobile>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className='hidden lg:block'>
          <Table className='w-full table-fixed'>
            <TableHeader>
              <TableRow className='border-b border-light-mint/30 hover:bg-light-mint/10'>
                <TableHead className='px-4 py-5 text-left text-prussian font-semibold text-sm w-[10%]'>
                  Start
                </TableHead>
                <TableHead className='px-4 py-5 text-left text-prussian font-semibold text-sm w-[16%]'>
                  Verein
                </TableHead>
                <TableHead className='px-4 py-5 text-left text-prussian font-semibold text-sm w-[22%]'>
                  Fähigkeiten
                </TableHead>
                <TableHead className='px-4 py-5 text-left text-prussian font-semibold text-sm w-[18%]'>
                  Projekt
                </TableHead>
                <TableHead className='px-4 py-5 text-left text-prussian font-semibold text-sm w-[18%]'>
                  Status
                </TableHead>
                <TableHead className='px-4 py-5 text-left text-prussian font-semibold text-sm w-[16%]'>
                  Aktionen
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow
                  key={application.id}
                  className='border-b border-light-mint/20 hover:bg-light-mint/5 transition-all duration-200'
                >
                  <TableCell className='px-4 py-5 w-[10%]'>
                    <span className='text-prussian font-medium block text-sm'>
                      {DateTime.fromISO(
                        String(application.project.startingAt),
                        {
                          zone: 'utc',
                        }
                      )
                        .setZone('Europe/Berlin')
                        .toFormat('dd.LL.yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className='px-4 py-5 w-[16%]'>
                    <Link
                      href={`/ngos/${application.ngo.id}`}
                      className='text-prussian hover:text-prussian/80 font-semibold transition-colors duration-200 block truncate text-sm'
                      title={application.ngo.name}
                    >
                      {application.ngo.name}
                    </Link>
                  </TableCell>
                  <TableCell className='px-4 py-5 w-[22%]'>
                    <div className='flex flex-wrap gap-1'>
                      {application.skills.slice(0, 2).map((skill) => (
                        <BadgeComponent
                          key={skill.id}
                          variant='skill'
                          size='sm'
                        >
                          {skill.name}
                        </BadgeComponent>
                      ))}
                      {application.skills.length > 2 && (
                        <BadgeComponent variant='count' size='sm'>
                          +{application.skills.length - 2}
                        </BadgeComponent>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='px-4 py-5 w-[18%]'>
                    <Link
                      href={`/projects/${application.projectId}`}
                      className='text-prussian hover:text-prussian/80 font-semibold transition-colors duration-200 block truncate text-sm'
                      title={application.project.name}
                    >
                      {application.project.name}
                    </Link>
                  </TableCell>
                  <TableCell className='px-4 py-5 w-[18%]'>
                    <div
                      title={
                        application.status === 'accepted'
                          ? 'Akzeptiert'
                          : application.status === 'rejected'
                          ? 'Abgelehnt'
                          : 'Ausstehend'
                      }
                    >
                      <BadgeComponent
                        variant={
                          application.status === 'accepted'
                            ? 'success'
                            : application.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                        className='px-2 py-1 rounded-full font-medium text-xs flex items-center gap-1 w-fit'
                      >
                        {application.status === 'accepted' ? (
                          <CircleCheck size={14} className='fill-green-500' />
                        ) : application.status === 'rejected' ? (
                          <CircleX size={14} className='fill-red-500' />
                        ) : (
                          <Loader size={14} />
                        )}
                        <span className='hidden lg:inline text-xs'>
                          {application.status === 'accepted'
                            ? 'Akzeptiert'
                            : application.status === 'rejected'
                            ? 'Abgelehnt'
                            : 'Ausstehend'}
                        </span>
                      </BadgeComponent>
                    </div>
                  </TableCell>
                  <TableCell className='px-4 py-5 w-[16%]'>
                    {application.status !== 'rejected' && (
                      <ApplicationWithdrawButton applicationId={application.id}>
                        <span className='hidden 2xl:inline'>Abbrechen</span>
                        <span className='2xl:hidden'>×</span>
                      </ApplicationWithdrawButton>
                    )}
                  </TableCell>
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
