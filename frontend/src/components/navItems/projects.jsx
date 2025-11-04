const projects = [
  {
    id: 1,
    name: "Mentorship & Career Counselling",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M15.59 17.74c-.629.422-2.277 1.282-1.273 2.358c.49.526 1.037.902 1.723.902h3.92c.686 0 1.233-.376 1.723-.902c1.004-1.076-.644-1.936-1.273-2.357a4.29 4.29 0 0 0-4.82 0M20 12.5a2 2 0 1 1-4 0a2 2 0 0 1 4 0M10 6h5m-5-3h8M7 9.5V14c0 .943 0 1.414-.293 1.707S5.943 16 5 16H4c-.943 0-1.414 0-1.707-.293S2 14.943 2 14v-2.5c0-.943 0-1.414.293-1.707S3.057 9.5 4 9.5zm0 0h5M6.5 5a2 2 0 1 1-4 0a2 2 0 0 1 4 0"
          color="currentColor"
        />
      </svg>
    ),
    categories: [
      "Career Guidance",
      "Academic Counselling",
      "Mental Health Support",
    ],
  },
  {
    id: 2,
    name: "Residential Training Project for EMRS Teachers",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <g
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          color="currentColor"
        >
          <path d="M2 2h14c1.886 0 2.828 0 3.414.586S20 4.114 20 6v6c0 1.886 0 2.828-.586 3.414S17.886 16 16 16H9m1-9.5h6M2 17v-4c0-.943 0-1.414.293-1.707S3.057 11 4 11h2m-4 6h4m-4 0v5m4-5v-6m0 6v5m0-11h6" />
          <path d="M6 6.5a2 2 0 1 1-4 0a2 2 0 0 1 4 0" />
        </g>
      </svg>
    ),
    categories: ["Training Modules", "Teaching Resources", "Assessment Tools"],
  },
  {
    id: 3,
    name: "Entrepreneurship Bootcamp for High School Students",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 16 16"
      >
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M.573 4.1a.999.999 0 0 0 0 1.808l1.43.675v3.92c0 .742.241 1.57.944 2.08c.886.64 2.5 1.42 5.06 1.42s4.17-.785 5.06-1.42c.703-.508.944-1.33.944-2.08v-3.92l1-.473v4.39a.5.5 0 0 0 1 0V5a1 1 0 0 0-.572-.904l-5.72-2.7a4 4 0 0 0-3.42 0l-5.72 2.7zm2.43 6.4V7.05l3.29 1.56a4 4 0 0 0 3.42 0l3.29-1.56v3.45c0 .556-.18 1.01-.53 1.26c-.724.523-2.13 1.24-4.47 1.24s-3.75-.712-4.47-1.24c-.349-.252-.529-.709-.529-1.26zm3.72-8.2a2.99 2.99 0 0 1 2.56 0l5.72 2.7l-5.72 2.7a2.99 2.99 0 0 1-2.56 0L1.003 5z"
          clip-rule="evenodd"
        />
      </svg>
    ),
    categories: ["Business Planning", "Market Research", "Financial Literacy"],
  },
  {
    id: 4,
    name: "Digital Device Procurement",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 36 36"
      >
        <path
          fill="currentColor"
          d="M32 13h-8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V15a2 2 0 0 0-2-2m0 2v11h-8V15Zm-8 15v-2.4h8V30Z"
          class="clr-i-outline clr-i-outline-path-1"
        />
        <path
          fill="currentColor"
          d="M20 22H4V6h24v5h2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16Z"
          class="clr-i-outline clr-i-outline-path-2"
        />
        <path
          fill="currentColor"
          d="M20 26H9a1 1 0 0 0 0 2h11Z"
          class="clr-i-outline clr-i-outline-path-3"
        />
        <path fill="none" d="M0 0h36v36H0z" />
      </svg>
    ),
    categories: ["Laptops", "Tablets", "Interactive Boards"],
  },
  {
    id: 5,
    name: "Sanitary Pad Devices Procurement",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <g fill="none">
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="1.5"
            d="M18 12h-.801c-.83 0-1.245 0-1.589.195c-.344.194-.557.55-.984 1.261l-.03.052c-.398.663-.597.994-.886.989s-.476-.344-.849-1.022l-1.687-3.067c-.347-.632-.52-.948-.798-.963c-.277-.015-.484.28-.897.87l-.283.405c-.44.627-.659.94-.984 1.11c-.326.17-.709.17-1.474.17H6"
          />
          <path
            fill="currentColor"
            d="m8.962 18.91l.464-.588zM12 5.5l-.54.52a.75.75 0 0 0 1.08 0zm3.038 13.41l.465.59zM12 20.487v-.75zm-9.343-7.09a.75.75 0 0 0 1.273-.792zm3.873 2.376a.75.75 0 0 0-1.06 1.062zM2.75 9.137c0-2.803 1.257-4.542 2.83-5.14c1.575-.6 3.771-.167 5.88 2.024l1.08-1.04C10.15 2.496 7.345 1.72 5.046 2.595C2.743 3.471 1.25 5.888 1.25 9.137zM15.503 19.5c1.492-1.177 3.28-2.754 4.703-4.516c1.407-1.743 2.544-3.775 2.544-5.847h-1.5c0 1.551-.872 3.246-2.211 4.905c-1.323 1.639-3.015 3.137-4.465 4.28zM22.75 9.137c0-3.25-1.493-5.666-3.796-6.542c-2.299-.874-5.103-.1-7.494 2.386l1.08 1.04c2.109-2.19 4.305-2.623 5.88-2.024c1.573.598 2.83 2.337 2.83 5.14zM8.497 19.5c1.275 1.004 2.153 1.736 3.503 1.736v-1.5c-.73 0-1.184-.319-2.574-1.414zm6.077-1.178c-1.39 1.095-1.843 1.414-2.574 1.414v1.5c1.35 0 2.228-.732 3.503-1.736zM3.93 12.604c-.746-1.199-1.18-2.373-1.18-3.467h-1.5c0 1.48.58 2.932 1.407 4.26zm5.496 5.718a34 34 0 0 1-2.896-2.55l-1.06 1.062A35 35 0 0 0 8.497 19.5z"
          />
        </g>
      </svg>
    ),
    categories: ["Dispensers", "Disposal Units", "Hygiene Products"],
  },
];

export default projects;
