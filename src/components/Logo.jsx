import logo from '../assets/logo.png';

export default function Logo({ size = 28 }) {
  return (
    <span className="logo">
      <img src={logo} alt="" width={size} height={size} />
      <span className="logo-word"><b>Giwa</b><i>Market</i></span>
    </span>
  );
}
