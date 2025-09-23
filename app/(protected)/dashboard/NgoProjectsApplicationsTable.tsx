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
import { Applications } from '@/types/application';
import { CircleCheck, CircleX, EllipsisVertical, Loader } from 'lucide-react';
import Link from 'next/link';
import { ApplicationAcceptButton } from './NgoApplicationAcceptButton';
import ApplicationRejectButton from './NgoApplicationRejectButton';

const NgoProjectsApplicationsTable = ({
  applications,
}: {
  applications: Applications;
}) => {
  return (
    <div className='w-full'>
      <div className='lg:bg-light-mint/10 backdrop-blur-xl rounded-[2rem] p-6 md:p-8'>
        <h3 className='text-xl lg:text-2xl font-bold text-prussian mb-2 tracking-tight'>
          Bewerbungen
        </h3>
        <p className='text-prussian/70 text-sm lg:text-base mb-8 font-medium'>
          Übersicht aller Bewerbungen auf deine Projekte.
        </p>

        {/* Mobile Card Layout */}
        <div className='block lg:hidden space-y-4'>
          {applications.map((application) => (
            <div
              key={application.id}
              className='bg-light-mint/10 border border-light-mint/30 rounded-2xl p-4 hover:bg-light-mint/15 transition-all duration-200 overflow-hidden'
            >
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                  <Link
                    href={`/users/${application.userId}`}
                    className='text-prussian hover:text-prussian/80 font-semibold text-lg transition-colors duration-200 block mb-1 truncate'
                  >
                    {application.user.firstName} {application.user.lastName}
                  </Link>
                  <Link
                    href={`/projects/${application.projectId}`}
                    className='text-prussian/70 hover:text-prussian text-sm transition-colors duration-200 truncate'
                  >
                    {application.project.name}
                  </Link>
                </div>
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ButtonComponent variant='action' size='sm'>
                      <EllipsisVertical size={16} />
                    </ButtonComponent>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='bg-white/95 backdrop-blur-xl border-light-mint/30 shadow-2xl rounded-2xl p-2'>
                    <DropdownMenuItem className='text-prussian hover:bg-light-mint/10 rounded-xl transition-colors duration-200 p-3'>
                      Details ansehen
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-green-600 hover:bg-green-50 rounded-xl transition-colors duration-200 p-3'></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </div>
              <div className='space-y-3'>
                <div>
                  <div className='text-prussian/60 text-xs font-medium mb-1 uppercase tracking-wide'>
                    Fähigkeiten
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {application.skills.slice(0, 4).map((skill) => (
                      <BadgeComponent key={skill.id} variant='skill' size='sm'>
                        {skill.name}
                      </BadgeComponent>
                    ))}
                    {application.skills.length > 4 && (
                      <BadgeComponent variant='count' size='sm'>
                        {application.skills.length - 4}
                      </BadgeComponent>
                    )}
                  </div>
                </div>

                <div className='flex flex-col gap-2 lg:gap-0 justify-between items-start pt-2 border-t border-light-mint/20'>
                  <div className='flex flex-col items-start gap-2'>
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
                      className='px-3 py-2 rounded-full font-medium text-sm flex items-center gap-2 w-fit'
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
                  <div className='flex flex-row gap-2 items-stretch w-auto'>
                    {application.status === 'pending' ? (
                      <>
                        <ApplicationRejectButton application={application}>
                          Ablehnen
                        </ApplicationRejectButton>
                        <ApplicationAcceptButton application={application}>
                          Akzeptieren
                        </ApplicationAcceptButton>
                      </>
                    ) : application.status === 'rejected' ? (
                      <ApplicationAcceptButton application={application}>
                        Akzeptieren
                      </ApplicationAcceptButton>
                    ) : (
                      <ApplicationRejectButton application={application}>
                        Ablehnen
                      </ApplicationRejectButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className='hidden lg:block overflow-x-auto'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow className='border-b border-light-mint/30 hover:bg-light-mint/10'>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Nutzer
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Fähigkeiten
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Projekt
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Status
                </TableHead>
                <TableHead className='px-6 py-5 text-left'></TableHead>
                <TableHead className='px-6 py-5 text-left'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow
                  key={application.id}
                  className='border-b border-light-mint/20 hover:bg-light-mint/5 transition-all duration-200'
                >
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <Link
                      href={`/users/${application.userId}`}
                      className='text-prussian hover:text-prussian/80 font-semibold transition-colors duration-200 max-w-[120px] truncate block break-words'
                    >
                      {application.user.firstName} {application.user.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <div className='flex flex-wrap gap-1 '>
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
                      className='text-prussian hover:text-prussian/80 font-semibold transition-colors duration-200 max-w-[120px] truncate block break-words'
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
                      className='px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 w-fit break-words'
                    >
                      {application.status === 'accepted' ? (
                        <CircleCheck size={16} className='fill-green-500' />
                      ) : application.status === 'rejected' ? (
                        <CircleX size={16} className='fill-red-500' />
                      ) : (
                        <Loader size={16} />
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
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <div className='flex items-center h-full break-words'>
                      {application.status === 'accepted' ? (
                        <div className='flex items-center h-full'>
                          <ApplicationRejectButton application={application}>
                            Ablehnen
                          </ApplicationRejectButton>
                        </div>
                      ) : application.status === 'rejected' ? (
                        <div className='flex items-center h-full'>
                          <ApplicationAcceptButton application={application}>
                            Akzeptieren
                          </ApplicationAcceptButton>
                        </div>
                      ) : (
                        <div className='flex gap-5 lg:gap-2 items-center h-full'>
                          <ApplicationAcceptButton application={application}>
                            Akzeptieren
                          </ApplicationAcceptButton>
                          <ApplicationRejectButton application={application}>
                            Ablehnen
                          </ApplicationRejectButton>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {/* <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ButtonComponent variant='action' size='sm'>
                          <EllipsisVertical size={16} />
                        </ButtonComponent>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='bg-white/95 backdrop-blur-xl border-light-mint/30 shadow-2xl rounded-2xl p-2'>
                        <DropdownMenuItem className='text-prussian hover:bg-light-mint/10 rounded-xl transition-colors duration-200 p-3'>
                          Details ansehen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell> */}
                  <TableCell className='w-full bg-transparent border-none'></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
export default NgoProjectsApplicationsTable;
