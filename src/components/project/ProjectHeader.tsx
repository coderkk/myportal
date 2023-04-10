import { Disclosure, Popover, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
} from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useRef } from "react";
import { api } from "../../utils/api";
import { Header, MobileNavLink } from "../common/Header";

type icon = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
    title?: string;
    titleId?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

const projectFeatures = [
  {
    name: "File management",
    description: "Organize and search for your files.",
    href: "/file-manager",
    icon: ChartPieIcon as icon,
  },
  {
    name: "Orders",
    description: "Derek, replace this",
    href: "/order",
    icon: CursorArrowRaysIcon as icon,
  },
  {
    name: "Request for information",
    description: "Derek, replace this",
    href: "/requestForInformation",
    icon: FingerPrintIcon as icon,
  },
  {
    name: "Site diary",
    description: "Derek, replace this",
    href: "/site-diary",
    icon: SquaresPlusIcon as icon,
  },
  {
    name: "Task management",
    description: "Derek, replace this",
    href: "/task",
    icon: ArrowPathIcon as icon,
  },
  {
    name: "Team",
    description: "Derek, replace this",
    href: "/team",
    icon: ArrowPathIcon as icon,
  },
];

const callsToAction = [
  { name: "Watch demo", href: "#", icon: PlayCircleIcon },
  { name: "Contact sales", href: "#", icon: PhoneIcon },
];

export const ProjectHeader = () => {
  const router = useRouter();
  const utils = api.useContext();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const projectId = router.query.projectId as string;

  const prefetch = ({
    projectId,
    href,
  }: {
    projectId: string;
    href: string;
  }) => {
    switch (href) {
      case "/file-manager":
        void utils.s3.fetchS3BucketContents.prefetch(
          { projectId: projectId, prefix: "/" },
          {
            staleTime: Infinity,
          }
        );
        break;
      case "/site-diary":
        void utils.siteDiary.getSiteDiaries.prefetch(
          { projectId: projectId },
          {
            staleTime: Infinity,
          }
        );
        break;
      case "/task":
        void utils.task.getTasks.prefetch(
          { projectId: projectId },
          {
            staleTime: Infinity,
          }
        );
        break;
      case "/team":
        void utils.user.getUsersForProject.prefetch(
          { projectId: projectId },
          {
            staleTime: Infinity,
          }
        );
        void utils.user.getUsers.prefetch(undefined, {
          staleTime: Infinity,
        });
        void utils.me.isCreatorOfProject.prefetch(
          { projectId: projectId },
          {
            staleTime: Infinity,
          }
        );
        break;
      case "/requestForInformation":
        void utils.requestForInformation.getRequestForInformations.prefetch(
          { projectId: projectId },
          {
            staleTime: Infinity,
          }
        );
        break;
      case "/order":
        void utils.order.getOrders.prefetch(
          { projectId: projectId },
          {
            staleTime: Infinity,
          }
        );
        break;
      default:
      // do nothing
    }
  };

  const desktopExtraComponents = (
    <Popover.Group className="px-2 py-1 lg:flex lg:gap-x-12">
      <Popover className="relative">
        <Popover.Button
          ref={buttonRef}
          className="flex items-center text-sm text-gray-900 hover:bg-slate-100 hover:text-slate-900"
        >
          Features
          <ChevronDownIcon
            className="h-5 w-5 flex-none text-gray-400"
            aria-hidden="true"
          />
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
            <div className="p-4">
              {projectFeatures.map((item) => (
                <div
                  key={item.name}
                  className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                >
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <item.icon
                      className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-auto">
                    <Link
                      href={`/projects/${projectId}${item.href}`}
                      className="block font-semibold text-gray-900"
                      onMouseEnter={() =>
                        prefetch({
                          projectId: projectId,
                          href: item.href,
                        })
                      }
                      onClick={() => buttonRef.current?.click()}
                    >
                      {item.name}
                      <span className="absolute inset-0" />
                    </Link>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
              {callsToAction.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100"
                >
                  <item.icon
                    className="h-5 w-5 flex-none text-gray-400"
                    aria-hidden="true"
                  />
                  {item.name}
                </a>
              ))}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </Popover.Group>
  );
  const mobileExtraComponents = (
    <MobileNavLink>
      <Disclosure as="div" className="-mx-3">
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full items-center justify-between rounded-lg pr-3.5 pl-3 leading-7 hover:bg-gray-50">
              Features
              <ChevronDownIcon
                className={`h-5 w-5 flex-none ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </Disclosure.Button>
            <Disclosure.Panel className="mt-2 space-y-1">
              {[...projectFeatures, ...callsToAction].map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={`${router.asPath}${item.href}`}
                  className="block rounded-lg py-2 pl-6 pr-3 text-sm leading-7 text-gray-900 hover:bg-gray-50"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </MobileNavLink>
  );
  return (
    <Header
      desktopExtraComponents={desktopExtraComponents}
      mobileExtraComponents={mobileExtraComponents}
    />
  );
};

export default ProjectHeader; // for dynamic import
