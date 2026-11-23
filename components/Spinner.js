export default function Spinner({ sm, light }) {
  return <span className={`spin${sm ? " sm" : ""}${light ? " light" : ""}`} role="status" aria-label="Loading" />;
}
export const Loading = () => <div className="center-load"><Spinner /></div>;
