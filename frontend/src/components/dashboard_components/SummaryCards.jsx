import React, { useState, useEffect } from "react";

const SummaryCards = ({ stats, loading, selectedState }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {selectedState === "" && (
      <SummaryCard
        title="Total States"
        value={stats.totalStates}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 512 512">
            <path
              fill="var(--color-primary)"
              d="M243.4 2.6l-224 96c-14 6-21.8 21-18.7 35.8S16.8 160 32 160l0 8c0 13.3 10.7 24 24 24l400 0c13.3 0 24-10.7 24-24l0-8c15.2 0 28.3-10.7 31.3-25.6s-4.8-29.9-18.7-35.8l-224-96c-8-3.4-17.2-3.4-25.2 0zM128 224l-64 0 0 196.3c-.6 .3-1.2 .7-1.8 1.1l-48 32c-11.7 7.8-17 22.4-12.9 35.9S17.9 512 32 512l448 0c14.1 0 26.5-9.2 30.6-22.7s-1.1-28.1-12.9-35.9l-48-32c-.6-.4-1.2-.7-1.8-1.1L448 224l-64 0 0 192-40 0 0-192-64 0 0 192-48 0 0-192-64 0 0 192-40 0 0-192zM256 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
            />
          </svg>
        }
        loading={loading}
      />
    )}
    <SummaryCard
      title="Total Districts"
      value={stats.totalDistricts}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 24 24"
        >
          <path
            fill="var(--color-primary)"
            d="M6.72 16.64a1 1 0 1 1 .56 1.92c-.5.146-.86.3-1.091.44c.238.143.614.303 1.136.452C8.48 19.782 10.133 20 12 20s3.52-.218 4.675-.548c.523-.149.898-.309 1.136-.452c-.23-.14-.59-.294-1.09-.44a1 1 0 0 1 .559-1.92c.668.195 1.28.445 1.75.766c.435.299.97.82.97 1.594c0 .783-.548 1.308-.99 1.607c-.478.322-1.103.573-1.786.768C15.846 21.77 14 22 12 22s-3.846-.23-5.224-.625c-.683-.195-1.308-.446-1.786-.768c-.442-.3-.99-.824-.99-1.607c0-.774.535-1.295.97-1.594c.47-.321 1.082-.571 1.75-.766M12 7.5c-1.54 0-2.502 1.667-1.732 3c.357.619 1.017 1 1.732 1c1.54 0 2.502-1.667 1.732-3A2 2 0 0 0 12 7.5"
            class="duoicon-primary-layer"
          />
          <path
            fill="var(--color-primary)"
            d="M12 2a7.5 7.5 0 0 1 7.5 7.5c0 2.568-1.4 4.656-2.85 6.14a16.4 16.4 0 0 1-1.853 1.615c-.594.446-1.952 1.282-1.952 1.282a1.71 1.71 0 0 1-1.69 0a21 21 0 0 1-1.952-1.282A16.4 16.4 0 0 1 7.35 15.64C5.9 14.156 4.5 12.068 4.5 9.5A7.5 7.5 0 0 1 12 2"
            class="duoicon-secondary-layer"
            opacity="0.3"
          />
        </svg>
      }
      loading={loading}
    />
    <SummaryCard
      title="Total Schools"
      value={stats.totalSchools}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
          width="44"
          height="44"
        >
          <path
            fill="var(--color-primary)"
            d="M337.8 5.4C327-1.8 313-1.8 302.2 5.4L166.3 96 48 96C21.5 96 0 117.5 0 144L0 464c0 26.5 21.5 48 48 48l208 0 0-96c0-35.3 28.7-64 64-64s64 28.7 64 64l0 96 208 0c26.5 0 48-21.5 48-48l0-320c0-26.5-21.5-48-48-48L473.7 96 337.8 5.4zM96 192l32 0c8.8 0 16 7.2 16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-64c0-8.8 7.2-16 16-16zm400 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-64zM96 320l32 0c8.8 0 16 7.2 16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-64c0-8.8 7.2-16 16-16zm400 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-64zM232 176a88 88 0 1 1 176 0 88 88 0 1 1 -176 0zm88-48c-8.8 0-16 7.2-16 16l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-16 0 0-16c0-8.8-7.2-16-16-16z"
          />
        </svg>
      }
      loading={loading}
    />
    <SummaryCard
      title="Active Projects"
      value={stats.activeProjects}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke="var(--color-primary)"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            color="currentColor"
          >
            <path d="M21.5 4.5a2 2 0 1 1-4 0a2 2 0 0 1 4 0m-1.029 4.906c.029.884.029 1.906.029 3.094c0 4.243 0 6.364-1.318 7.682S15.742 21.5 11.5 21.5s-6.364 0-7.682-1.318S2.5 16.742 2.5 12.5s0-6.364 1.318-7.682S7.258 3.5 11.5 3.5c1.188 0 2.21 0 3.094.029" />
            <path d="m6.5 14.5l2.793-2.793a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L16.5 10.5" />
          </g>
        </svg>
      }
      loading={loading}
    />
  </div>
);

const SummaryCard = ({ title, value, icon, color, loading }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!loading) {
      let startValue = 0;
      const duration = 1000; // Animation duration in milliseconds
      const increment = value / (duration / 16); // Increment per frame (assuming ~60fps)

      const interval = setInterval(() => {
        startValue += increment;
        if (startValue >= value) {
          clearInterval(interval);
          setAnimatedValue(value); // Ensure the final value is set
        } else {
          setAnimatedValue(Math.floor(startValue));
        }
      }, 16); // ~60fps

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [value, loading]);

  return (
    <div
      className={`rounded-xl p-6 flex items-center theme-transition shadow-xl  
              bg-gradient-to-br from-[var(--color-surface)] to-[rgba(255,255,255,0.02)] 
              backdrop-blur-[2px] border border-[rgba(255,255,255,0.05)] transition-all`}
    >
      <span className="mr-4">{icon}</span>
      <div className="flex-1">
        <h3 className="text-[var(--color-text-secondary)] font-redhat text-sm mb-1">
          {title}
        </h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        ) : (
          <p className="text-2xl font-outfit font-semibold text-[var(--color-text)]">
            {animatedValue.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;
