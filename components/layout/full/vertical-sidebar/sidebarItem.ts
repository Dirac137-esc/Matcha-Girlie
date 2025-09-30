import {
    AlertHexagonIcon,
    AlignBoxBottomLeftIcon,
    AppWindowIcon,
    CopyIcon,
    LayoutDashboardIcon,
    LoginIcon,
    PointIcon,
    TableIcon,
    CardboardsIcon,
    TypographyIcon,
    UserPlusIcon,
    UserShieldIcon,
} from "vue-tabler-icons";

export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    to?: string;
    chip?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    type?: string;
    subCaption?: string;
    external?: boolean;
}

const sidebarItem: menu[] = [
    { header: "Дэлгүүр" },
    {
        title: "Хянах самбар",
        icon: LayoutDashboardIcon,
        to: "/",
        external: false,
    },

    {
        title: "Танилцуулга хуудсууд",
        icon: AppWindowIcon,
        chip: "Pro",
        to: "/",
        children: [
            {
                title: "Нүүр хуудас",
                chip: "P",
                icon: PointIcon,
            },
            {
                title: "Бидний тухай",
                chip: "P",
                icon: PointIcon,
            },
        ],
    },

    { header: "Бүтээгдэхүүн" },
    {
        title: "Матча цай",
        icon: TypographyIcon,
        to: "/ui/typography",
        external: false,
    },
    {
        title: "Дагалдах хэрэгсэл",
        icon: CopyIcon,
        to: "/ui/shadow",
        external: false,
    },

    { header: "Борлуулалт" },
    {
        title: "Details",
        icon: AlertHexagonIcon,
        to: "/detail",
    },
    {
        title: "Orders",
        icon: AlertHexagonIcon,
        to: "/order",
    },
    {
        title: "Захиалга",
        icon: AlertHexagonIcon,
        to: "/ui-components/alerts",
    },
    {
        title: "Сагс",
        icon: AlignBoxBottomLeftIcon,
        to: "/ui-components/buttons",
    },
    {
        title: "Хямдрал & купон",
        icon: CardboardsIcon,
        to: "/ui-components/cards",
    },
    {
        title: "Борлуулалтын хүснэгт",
        icon: TableIcon,
        to: "/ui-components/tables",
    },

    { header: "Хэрэглэгч" },
    {
        title: "Нэвтрэх",
        icon: LoginIcon,
        to: "/auth/login",
        external: false,
    },
    {
        title: "Бүртгүүлэх",
        icon: UserPlusIcon,
        to: "/auth/register",
        external: false,
    },
    {
        title: "Нэвтрэхийн хуудсууд",
        icon: UserShieldIcon,
        chip: "P",
        to: "#",
        children: [
            {
                title: "Хажуугийн нэвтрэлт",
                icon: PointIcon,
                chip: "P",
            },
            {
                title: "Хайрцаг хэлбэрийн нэвтрэлт",
                icon: PointIcon,
                chip: "P",
            },
        ],
    },
];

export default sidebarItem;
