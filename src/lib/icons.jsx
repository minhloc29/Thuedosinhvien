// ---------------------------------------------------------------------------
// LabShare — shared icon layer.
//
// Single source of truth for every icon used across BOTH frontends. Wraps
// @mui/icons-material behind the lucide-style props the components already
// use (`size` in px, `color` hex, optional `strokeWidth` which MUI ignores),
// so call sites — including dynamic renderers that do `<Icon size={N} color=…/>`
// — keep working unchanged when the icon source was swapped from lucide→MUI.
// ---------------------------------------------------------------------------
import * as M from "@mui/icons-material";

// Wrap an MUI icon so it accepts pixel `size` + hex `color` (like lucide did).
// `strokeWidth` is a lucide concept MUI doesn't support — swallow it rather
// than forward it (React would warn on the unknown prop).
const wrap = (C) => (props) => {
  const { size = 24, color, strokeWidth, sx, ...rest } = props;
  return <C sx={{ fontSize: size, color, ...(sx || {}) }} {...rest} />;
};

export const Search          = wrap(M.Search);
export const Plus            = wrap(M.Add);
export const Check           = wrap(M.Check);
export const X               = wrap(M.Close);
export const HomeIcon        = wrap(M.Home);
export const User            = wrap(M.Person);
export const ShieldCheck     = wrap(M.VerifiedUser);
export const ArrowRight      = wrap(M.ArrowForward);
export const Wallet          = wrap(M.AccountBalanceWallet);
export const Package         = wrap(M.Inventory2);
export const Tag             = wrap(M.Sell);
export const Scale           = wrap(M.Balance);
export const MapPin          = wrap(M.LocationOn);
export const Star            = wrap(M.Star);
export const StarBorder      = wrap(M.StarBorder);
export const ClipboardCheck  = wrap(M.AssignmentTurnedIn);
export const BarChart3       = wrap(M.BarChart);
export const Timer           = wrap(M.Schedule);
export const Sparkles        = wrap(M.AutoAwesome);
export const Boxes           = wrap(M.Inventory);
export const Microscope      = wrap(M.Biotech);
export const Cpu             = wrap(M.Memory);
export const CircuitBoard    = wrap(M.Memory);
export const GraduationCap   = wrap(M.School);
export const BadgeCheck      = wrap(M.Badge);
export const PackageCheck    = wrap(M.Inventory2);
