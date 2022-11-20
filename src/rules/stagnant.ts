import fm from "front-matter";
import { Octokit, Config, FrontMatter, File, Rule } from "../types.js";

export default async function (_octokit: Octokit, config: Config, files: File[] ) : Promise<Rule[]> {
    // Get results
    let res : Rule[][] = await Promise.all(files.map(async file => {
        if (!file.filename.endsWith(".md")) return [];

        let frontMatter = fm<FrontMatter>(file.previous_contents as string);
        let status = frontMatter.attributes?.status?.toLowerCase();
        
        if (status == "stagnant") {
            return [{
                name: "stagnant",
                reviewers: config[(frontMatter.attributes?.category || frontMatter.attributes?.type || "all").toLowerCase()],
                min: 1,
                annotation: {
                    file: file.filename
                }
            }];
        }

        return [];
    }));

    // Merge results
    let ret: Rule[] = [];
    res.forEach(val => ret.push(...val));
    return ret;
}
