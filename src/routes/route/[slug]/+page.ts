/** @type {import('./$types').PageLoad} */
export function load({ params }: { params: any }) {
  return {
    id: params.slug,
  };
}