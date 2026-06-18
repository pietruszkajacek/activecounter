type Props = {
  className?: string;
};

export default function ActiveCounterLogo({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 154.37 47.587"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Active counter logo"
    >
      <g transform="translate(-19.51 -80.447)">

        {/* ACTIVE */}
        <path
          d="m87.155 108.07h-6.8529l-1.0874 3.4391h-4.4l6.2966-18.877h5.2219l6.2966 18.877h-4.4127zm-5.7656-3.5023h4.6529l-2.3138-7.5104zm..."
          fill="none"
          stroke="currentColor"
          strokeWidth="0.88186"
        />

        {/* counter */}
        <path d="m81.356 119.32v1.3555..." fill="currentColor" />
        <path d="m160.67 121.5h-8.0701v-1.4974h8.0701z" fill="currentColor" />
        <path d="m169.76 117.19v4.1296h4.1139v1.8599h-4.1139v4.1296h-1.8757v-4.1296h-4.1139v-1.8599h4.1139v-4.1296z" fill="currentColor" />

        {/* bars */}
        <path d="m32.385 100.79h7.4087v21h-7.4087z" fill="currentColor" />
        <path d="m44.742 95.028h7.4087v26.7h-7.4087z" fill="currentColor" />
        <path d="m57.1 95.029h7.4087v26.7h-7.4087z" fill="currentColor" />

      </g>
    </svg>
  );
}