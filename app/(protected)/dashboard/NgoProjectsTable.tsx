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
import { Projects } from '@/types/project';
import { EllipsisVertical } from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';

const NgoProjectsTable = ({ projects }: { projects: Projects }) => {
  return (
    <div className='w-full'>
      <div className='lg:bg-light-mint/10 backdrop-blur-xl rounded-[2rem] p-6 md:p-8'>
        <h3 className='text-xl lg:text-2xl font-bold text-prussian mb-2 tracking-tight'>
          Deine Projekte
        </h3>
        <p className='text-prussian/70 text-sm lg:text-base mb-8 font-medium'>
          Eine Übersicht deiner aktuellen Projekte und deren Status.
        </p>

        {/* Mobile Card Layout */}
        <div className='block lg:hidden space-y-4'>
          {projects.map((project) => (
            <div
              key={project.id}
              className='bg-light-mint/10 border border-light-mint/30 rounded-2xl p-4 hover:bg-light-mint/15 transition-all duration-200'
            >
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                  <Link
                    href={`/projects/${project.id}`}
                    className='text-prussian hover:text-prussian/80 font-semibold text-lg transition-colors duration-200 block mb-1'
                  >
                    {project.name}
                  </Link>
                  <div className='text-prussian/70 text-sm font-medium'>
                    Start:{' '}
                    {DateTime.fromISO(String(project.startingAt), {
                      zone: 'utc',
                    })
                      .setZone('Europe/Berlin')
                      .toFormat('dd.LL.yyyy')}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ButtonComponent variant='action' size='sm'>
                      <EllipsisVertical size={16} />
                    </ButtonComponent>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='bg-white/95 backdrop-blur-xl border-light-mint/30 shadow-2xl rounded-2xl p-2'>
                    <DropdownMenuItem className='text-prussian hover:bg-light-mint/10 rounded-xl transition-colors duration-200 p-3'>
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200 p-3'>
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className='space-y-3'>
                <div>
                  <div className='text-prussian/60 text-xs font-medium mb-1 uppercase tracking-wide'>
                    Gesuchte Fähigkeiten
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {project.skills.slice(0, 4).map((skill) => (
                      <BadgeComponent key={skill.id} variant='skill' size='sm'>
                        {skill.name}
                      </BadgeComponent>
                    ))}
                    {project.skills.length > 4 && (
                      <BadgeComponent variant='count' size='sm'>
                        +{project.skills.length - 4}
                      </BadgeComponent>
                    )}
                  </div>
                </div>

                <div className='flex justify-between items-center pt-2 border-t border-light-mint/20'>
                  <div className='text-prussian/60 text-xs font-medium uppercase tracking-wide'>
                    Anfragen
                  </div>
                  <BadgeComponent
                    variant='count'
                    className='lg:p-3 bg-light-mint/20 border-light-mint/40 text-prussian font-semibold rounded-full'
                  >
                    {project.stats?.totalApplications || 0}
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
                  Titel
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Gesucht
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap text-prussian font-semibold text-sm'>
                  Anfragen
                </TableHead>
                <TableHead className='px-6 py-5 text-left whitespace-nowrap'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className='border-b border-light-mint/20 hover:bg-light-mint/5 transition-all duration-200'
                >
                  <TableCell className='px-6 py-5 whitespace-nowrap text-prussian font-medium'>
                    {DateTime.fromISO(String(project.startingAt), {
                      zone: 'utc',
                    })
                      .setZone('Europe/Berlin')
                      .toFormat('dd.LL.yyyy')}
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <Link
                      href={`/projects/${project.id}`}
                      className='text-prussian hover:text-prussian/80 font-semibold transition-colors duration-200'
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <div className='flex flex-wrap gap-1'>
                      {project.skills.slice(0, 3).map((skill) => (
                        <BadgeComponent
                          key={skill.id}
                          variant='skill'
                          size='sm'
                        >
                          {skill.name}
                        </BadgeComponent>
                      ))}
                      {project.skills.length > 3 && (
                        <BadgeComponent variant='count' size='sm'>
                          +{project.skills.length - 3}
                        </BadgeComponent>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <BadgeComponent
                        variant='count'
                        className='py-2 px-4 bg-light-mint/20 border-light-mint/40 text-prussian font-semibold rounded-full'
                      >
                        {project.stats?.totalApplications || 0}
                      </BadgeComponent>
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-5 whitespace-nowrap'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ButtonComponent variant='action' size='sm'>
                          <EllipsisVertical size={16} />
                        </ButtonComponent>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='bg-white/95 backdrop-blur-xl border-light-mint/30 shadow-2xl rounded-2xl p-2'>
                        <DropdownMenuItem className='text-prussian hover:bg-light-mint/10 rounded-xl transition-colors duration-200 p-3'>
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem className='text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200 p-3'>
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
      </div>
    </div>
  );
};

export default NgoProjectsTable;
