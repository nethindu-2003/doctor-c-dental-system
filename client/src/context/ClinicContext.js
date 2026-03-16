import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import api from '../api/axios';

// -----------------------------------------------------------------------
// The shape of the data we expect from /auth/public/settings:
// {
//   clinicName: "Doctor C Dental Surgery",
//   clinicAddress: "No. 20, Circular rd, Devinuwara, Sri Lanka",
//   clinicPhone: "+94 70 513 9901",
//   clinicEmail: "doctorcdentalsurgery@gmail.com",
//   clinicLogo: "<base64 string or URL>",
//   standardBookingFee: 500,
//   schedules: [
//     { dayOfWeek: "MONDAY", isClosed: false, openTime: "16:30:00", closeTime: "21:00:00" },
//     ... (7 days total)
//   ]
// }
// -----------------------------------------------------------------------

const ClinicContext = createContext(null);

// The exported custom hook for consuming the context
export const useClinic = () => useContext(ClinicContext);

// Default fallback values so the UI never shows "undefined" or "closed" on mount
const DEFAULT_CONFIG = {
  clinicName: 'Doctor C',
  clinicAddress: 'No. 20, Circular rd, Devinuwara, Sri Lanka',
  clinicPhone: '+94 70 513 9901',
  clinicEmail: 'doctorcdentalsurgery@gmail.com',
  clinicLogo: '',
  standardBookingFee: 500,
};

// These match the original hardcoded hours. Initializing state with these
// ensures the footer and calendar show values immediately while the API loads.
const DEFAULT_SCHEDULES = [
  { dayOfWeek: 'MONDAY',    isClosed: false, openTime: '16:30:00', closeTime: '21:00:00' },
  { dayOfWeek: 'TUESDAY',   isClosed: false, openTime: '16:30:00', closeTime: '21:00:00' },
  { dayOfWeek: 'WEDNESDAY', isClosed: false, openTime: '16:30:00', closeTime: '21:00:00' },
  { dayOfWeek: 'THURSDAY',  isClosed: false, openTime: '16:30:00', closeTime: '21:00:00' },
  { dayOfWeek: 'FRIDAY',    isClosed: false, openTime: '16:30:00', closeTime: '21:00:00' },
  { dayOfWeek: 'SATURDAY',  isClosed: false, openTime: '18:30:00', closeTime: '21:00:00' },
  { dayOfWeek: 'SUNDAY',    isClosed: false, openTime: '09:00:00', closeTime: '12:00:00' },
];

// Day index used by dayjs().day() → 0=Sun, 1=Mon, ..., 6=Sat
const DAY_INDEX_TO_NAME = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

// Build a quick-lookup map: { "MONDAY": scheduleObj, ... }
const buildScheduleMap = (schedulesArray) => {
  const map = {};
  if (Array.isArray(schedulesArray)) {
    schedulesArray.forEach((s) => {
      map[s.dayOfWeek] = s;
    });
  }
  return map;
};

const DEFAULT_SCHEDULE_MAP = buildScheduleMap(DEFAULT_SCHEDULES);

export const ClinicProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [schedules, setSchedules] = useState(DEFAULT_SCHEDULES);
  const [scheduleMap, setScheduleMap] = useState(DEFAULT_SCHEDULE_MAP);
  const [clinicLoading, setClinicLoading] = useState(true);

  useEffect(() => {
    const fetchClinicSettings = async () => {
      try {
        // Uses the public-facing settings endpoint (no auth required)
        // Note: remove leading slash if using relative paths with baseURL
        const res = await api.get('public/settings');
        const data = res.data;

        if (data) {
          setConfig({
            clinicName: data.clinicName || DEFAULT_CONFIG.clinicName,
            clinicAddress: data.clinicAddress || DEFAULT_CONFIG.clinicAddress,
            clinicPhone: data.clinicPhone || DEFAULT_CONFIG.clinicPhone,
            clinicEmail: data.clinicEmail || DEFAULT_CONFIG.clinicEmail,
            clinicLogo: data.clinicLogo || DEFAULT_CONFIG.clinicLogo,
            standardBookingFee: data.standardBookingFee != null
              ? data.standardBookingFee
              : DEFAULT_CONFIG.standardBookingFee,
          });

          if (data.schedules && data.schedules.length > 0) {
            const dayOrder = {
              MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
              THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
            };
            const sorted = [...data.schedules].sort(
              (a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek]
            );
            setSchedules(sorted);
            setScheduleMap(buildScheduleMap(sorted));
          }
        }
      } catch (err) {
        console.warn('[ClinicContext] API fetch failed. Using built-in defaults.', err.message);
      } finally {
        setClinicLoading(false);
      }
    };

    fetchClinicSettings();
  }, []);

  /**
   * getScheduleForDayIndex(dayjsDayIndex)
   * Accepts the day number returned by dayjs().day() (0=Sun … 6=Sat)
   * Returns the matching schedule object, or null if not found.
   * 
   * Wrapped in useCallback so the function reference is stable 
   * between renders (prevents infinite re-rendering in consumers).
   */
  const getScheduleForDayIndex = useCallback((dayjsDayIndex) => {
    const dayName = DAY_INDEX_TO_NAME[dayjsDayIndex];
    return scheduleMap[dayName] || null;
  }, [scheduleMap]);

  return (
    <ClinicContext.Provider
      value={{
        config,
        schedules,
        scheduleMap,
        clinicLoading,
        getScheduleForDayIndex,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};
