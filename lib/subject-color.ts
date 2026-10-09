/**
 * Maps a product's dashboard color (`ProductColorType`, a Tailwind palette name)
 * to the Fluently swatch used for its cards, chips and timetable pills. The
 * merchant picks the color per product in the dashboard; the template never
 * hard-codes which language is which color.
 */

export interface Swatch {
	/** Saturated card / pill background. */
	bg: string;
	/** Soft tint for chips and section washes. */
	soft: string;
	/** Text color that reads on `bg`. */
	ink: string;
}

const INK = '#16131F';
const WHITE = '#FFFFFF';

const SWATCHES: Record<string, Swatch> = {
	red: { bg: '#FF5A5F', soft: '#FFE3E3', ink: WHITE },
	rose: { bg: '#FF6B8B', soft: '#FFE4EB', ink: WHITE },
	orange: { bg: '#FF7A45', soft: '#FFE8DC', ink: INK },
	amber: { bg: '#FFC93C', soft: '#FFF3D1', ink: INK },
	yellow: { bg: '#FFDA45', soft: '#FFF6CC', ink: INK },
	lime: { bg: '#B6E35B', soft: '#EEF9D7', ink: INK },
	green: { bg: '#4CCB7A', soft: '#DDF6E6', ink: INK },
	emerald: { bg: '#3DD6A3', soft: '#D8F7EC', ink: INK },
	teal: { bg: '#2EC4B6', soft: '#D5F4F1', ink: INK },
	cyan: { bg: '#4DD0E1', soft: '#DAF5F9', ink: INK },
	sky: { bg: '#5AB8FF', soft: '#DDEFFF', ink: INK },
	blue: { bg: '#4D7CFE', soft: '#DFE7FF', ink: WHITE },
	indigo: { bg: '#6366F1', soft: '#E3E3FD', ink: WHITE },
	violet: { bg: '#7C5CFF', soft: '#E9E3FF', ink: WHITE },
	purple: { bg: '#A35CFF', soft: '#F0E3FF', ink: WHITE },
	fuchsia: { bg: '#E15CF0', soft: '#FBE3FD', ink: WHITE },
	pink: { bg: '#FF8AC7', soft: '#FFE6F3', ink: INK },
	slate: { bg: '#94A3B8', soft: '#EEF1F5', ink: INK },
	gray: { bg: '#A1A1AA', soft: '#F0F0F2', ink: INK },
	zinc: { bg: '#A1A1AA', soft: '#F0F0F2', ink: INK },
	neutral: { bg: '#A3A3A3', soft: '#F1F1F1', ink: INK },
	stone: { bg: '#A8A29E', soft: '#F2F0EE', ink: INK },
};

/** Default when a product has no color: the brand grape. */
export const DEFAULT_SWATCH: Swatch = SWATCHES.violet!;

export function swatchFor(color: string | null | undefined): Swatch {
	return (color && SWATCHES[color]) || DEFAULT_SWATCH;
}
